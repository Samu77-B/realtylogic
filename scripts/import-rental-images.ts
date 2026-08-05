/**
 * Download rental images from Webflow CDN URLs (CSV), upload to Vercel Blob,
 * insert Media rows, and attach them to properties_rent by slug.
 *
 * Uses direct Postgres (no Payload local API) — read-only against Webflow CDN.
 *
 * Usage:
 *   npx tsx scripts/import-rental-images.ts
 *   npx tsx scripts/import-rental-images.ts --dry-run
 *   npx tsx scripts/import-rental-images.ts --limit=5
 *   npx tsx scripts/import-rental-images.ts --slug=foo
 *   npx tsx scripts/import-rental-images.ts --force
 */

import './load-env-first'
import { parse } from 'csv-parse/sync'
import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'
import pg from 'pg'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { applyRealtyLogicWatermark } from '../lib/media/watermark'

const LOG_FILE = join(process.cwd(), 'import-rental-images.log')
function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  try {
    appendFileSync(LOG_FILE, line + '\n')
  } catch {
    // ignore
  }
}

const DATA_DIR = join(process.cwd(), '_data')
const RENTS_CSV = join(DATA_DIR, 'Realty Logic cms - Properties for rents - 67b5019005baccbd347c5005.csv')

type Args = {
  dryRun: boolean
  force: boolean
  limit: number | null
  slug: string | null
}

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false, force: false, limit: null, slug: null }
  for (const a of argv) {
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--force') args.force = true
    else if (a.startsWith('--limit=')) {
      const n = parseInt(a.slice('--limit='.length), 10)
      if (Number.isFinite(n) && n > 0) args.limit = n
    } else if (a.startsWith('--slug=')) {
      args.slug = a.slice('--slug='.length).trim() || null
    }
  }
  return args
}

function splitUrls(value: string | undefined): string[] {
  if (!value?.trim()) return []
  return value
    .split(/[;\n]/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s))
}

function filenameFromUrl(url: string, fallback: string): string {
  try {
    const base = decodeURIComponent(new URL(url).pathname.split('/').pop() || fallback)
    return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || fallback
  } catch {
    return fallback
  }
}

function rowId(): string {
  return randomBytes(12).toString('hex')
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'RealtyLogic-image-import/1.0' },
  })
  if (!res.ok) throw new Error(`Download failed ${res.status} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function uploadToMedia(
  client: pg.Client,
  token: string,
  input: Buffer,
  alt: string,
  nameHint: string,
): Promise<number> {
  const normalised = await sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer()

  const watermarked = await applyRealtyLogicWatermark(normalised)
  const meta = await sharp(watermarked).metadata()
  const base = nameHint.replace(/\.[^.]+$/, '') || 'image'
  const filename = `${base}-${Date.now()}.jpg`

  const blob = await put(`media/${filename}`, watermarked, {
    access: 'public',
    token,
    contentType: 'image/jpeg',
    addRandomSuffix: true,
  })

  // Vercel Blob's random suffix is in the URL; pathname/filename from put() can omit it.
  // Payload regenerates media URLs from filename — must match the real object key.
  const storedName =
    decodeURIComponent(new URL(blob.url).pathname.split('/').pop() || '') ||
    blob.pathname.split('/').pop() ||
    filename
  const result = await client.query(
    `
    INSERT INTO media (
      alt, url, filename, mime_type, filesize, width, height, watermarked, created_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW())
    RETURNING id
    `,
    [
      alt,
      blob.url,
      storedName,
      'image/jpeg',
      watermarked.length,
      meta.width ?? null,
      meta.height ?? null,
    ],
  )
  return result.rows[0].id as number
}

async function main() {
  writeFileSync(LOG_FILE, '')
  const args = parseArgs(process.argv.slice(2))

  if (!existsSync(RENTS_CSV)) throw new Error(`Rentals CSV not found: ${RENTS_CSV}`)
  if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI is not set in .env')

  let token = process.env.BLOB_READ_WRITE_TOKEN?.replace(/^["']|["']$/g, '').trim() || ''
  if (token) process.env.BLOB_READ_WRITE_TOKEN = token
  if (!args.dryRun && !token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set in .env')
  }
  if (!args.dryRun && !/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i.test(token)) {
    throw new Error('BLOB_READ_WRITE_TOKEN format invalid. Expected vercel_blob_rw_<storeId>_<secret>')
  }

  const rows = parse(readFileSync(RENTS_CSV, 'utf8'), {
    columns: true,
    relax_column_count: true,
    relax_quotes: true,
    skip_empty_lines: true,
  }) as Record<string, string>[]

  let targets = rows.filter((row) => row['Draft'] !== 'true' && row['Slug']?.trim() && row['Name']?.trim())
  if (args.slug) targets = targets.filter((row) => row['Slug']?.trim() === args.slug)
  if (args.limit) targets = targets.slice(0, args.limit)

  log(
    `Rentals to process: ${targets.length}` +
      (args.dryRun ? ' (dry-run)' : '') +
      (args.force ? ' (force)' : ''),
  )

  if (args.dryRun) {
    let imageCount = 0
    for (const row of targets) {
      const unique = new Set([
        ...splitUrls(row['Main Property Image']),
        ...splitUrls(row['Property Images']),
        ...splitUrls(row['Floor Plan']),
      ])
      imageCount += unique.size
      log(`  ${row['Slug']}: ${unique.size} image(s)`)
    }
    log(`Total unique image URLs: ${imageCount}`)
    process.exit(0)
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })
  log('Connecting to Postgres...')
  await client.connect()
  log('Connected.')

  let updated = 0
  let skipped = 0
  let failed = 0
  let uploaded = 0

  for (const row of targets) {
    const slug = row['Slug']!.trim()
    const title = row['Name']!.trim()

    try {
      const found = await client.query(
        `SELECT id, main_image_id, floor_plan_id FROM properties_rent WHERE slug = $1 LIMIT 1`,
        [slug],
      )
      if (found.rows.length === 0) {
        log(`SKIP ${slug} — not in database`)
        skipped++
        continue
      }

      const property = found.rows[0] as {
        id: number
        main_image_id: number | null
        floor_plan_id: number | null
      }

      const galleryCount = await client.query(
        `SELECT COUNT(*)::int AS n FROM properties_rent_images WHERE _parent_id = $1 AND image_id IS NOT NULL`,
        [property.id],
      )
      const hasMain = Boolean(property.main_image_id)
      const hasGallery = (galleryCount.rows[0].n as number) > 0
      const hasFloor = Boolean(property.floor_plan_id)

      if (!args.force && hasMain && hasGallery) {
        log(`SKIP ${slug} — already has main + gallery (use --force to replace)`)
        skipped++
        continue
      }

      const mainUrl = splitUrls(row['Main Property Image'])[0]
      const galleryOnly = splitUrls(row['Property Images']).filter((u) => u !== mainUrl)
      const floorUrl = splitUrls(row['Floor Plan'])[0]

      if (!mainUrl && galleryOnly.length === 0 && !floorUrl) {
        log(`SKIP ${slug} — no image URLs in CSV`)
        skipped++
        continue
      }

      log(`→ ${slug} (main=${mainUrl ? 1 : 0}, gallery=${galleryOnly.length}, floor=${floorUrl ? 1 : 0})`)

      let mainImageId: number | null = null
      if (mainUrl && (args.force || !hasMain)) {
        const buf = await downloadImage(mainUrl)
        mainImageId = await uploadToMedia(
          client,
          token,
          buf,
          `${title} — main`,
          filenameFromUrl(mainUrl, `${slug}-main`),
        )
        uploaded++
        log('   uploaded main')
      }

      const galleryIds: number[] = []
      if (galleryOnly.length > 0 && (args.force || !hasGallery)) {
        if (args.force && hasGallery) {
          await client.query(`DELETE FROM properties_rent_images WHERE _parent_id = $1`, [property.id])
        }
        for (let i = 0; i < galleryOnly.length; i++) {
          const url = galleryOnly[i]!
          const buf = await downloadImage(url)
          const id = await uploadToMedia(
            client,
            token,
            buf,
            `${title} — photo ${i + 1}`,
            filenameFromUrl(url, `${slug}-${i + 1}`),
          )
          galleryIds.push(id)
          uploaded++
          if ((i + 1) % 5 === 0 || i + 1 === galleryOnly.length) {
            log(`   gallery ${i + 1}/${galleryOnly.length}`)
          }
        }
      }

      let floorPlanId: number | null = null
      if (floorUrl && (args.force || !hasFloor)) {
        const buf = await downloadImage(floorUrl)
        floorPlanId = await uploadToMedia(
          client,
          token,
          buf,
          `${title} — floor plan`,
          filenameFromUrl(floorUrl, `${slug}-floor`),
        )
        uploaded++
        log('   uploaded floor plan')
      }

      if (mainImageId != null) {
        const urlRow = await client.query(`SELECT url FROM media WHERE id = $1`, [mainImageId])
        const blobUrl = (urlRow.rows[0]?.url as string | undefined) || null
        await client.query(
          `UPDATE properties_rent SET main_image_id = $1, main_image_url = $2, updated_at = NOW() WHERE id = $3`,
          [mainImageId, blobUrl, property.id],
        )
      }
      if (floorPlanId != null) {
        await client.query(
          `UPDATE properties_rent SET floor_plan_id = $1, updated_at = NOW() WHERE id = $2`,
          [floorPlanId, property.id],
        )
      }
      if (galleryIds.length > 0) {
        for (let i = 0; i < galleryIds.length; i++) {
          await client.query(
            `
            INSERT INTO properties_rent_images (_order, _parent_id, id, image_id)
            VALUES ($1, $2, $3, $4)
            `,
            [i + 1, property.id, rowId(), galleryIds[i]],
          )
        }
      }

      if (mainImageId == null && galleryIds.length === 0 && floorPlanId == null) {
        log(`SKIP ${slug} — nothing new to attach`)
        skipped++
        continue
      }

      updated++
      log(`OK  ${slug}`)
    } catch (err) {
      failed++
      log(`FAIL ${slug}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  await client.end()
  log(`Done. updated=${updated} skipped=${skipped} failed=${failed} mediaUploaded=${uploaded}`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  log(`Import failed: ${err instanceof Error ? err.stack || err.message : String(err)}`)
  process.exit(1)
})

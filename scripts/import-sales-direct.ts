/**
 * Import sales from Webflow CSV directly into Neon Postgres.
 * Leaves images empty for admin upload later.
 */

import './load-env-first'
import { parse } from 'csv-parse/sync'
import { readFileSync, existsSync, copyFileSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

const DATA_DIR = join(process.cwd(), '_data')
const SALES_FILENAME = 'Realty Logic cms - Properties for sales - 67b4da058995edee624a0d4a.csv'
const SALES_CSV = join(DATA_DIR, SALES_FILENAME)
const SOURCE_CSV = join(process.cwd(), '..', '..', SALES_FILENAME)

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\u200d/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseBool(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

function parseOptionalInt(value: string | undefined): number | null {
  const n = parseInt(value?.trim() || '', 10)
  return Number.isFinite(n) ? n : null
}

async function main() {
  if (!existsSync(SALES_CSV) && existsSync(SOURCE_CSV)) {
    copyFileSync(SOURCE_CSV, SALES_CSV)
    console.log('Copied sales CSV into _data')
  }
  if (!existsSync(SALES_CSV)) {
    throw new Error(`Sales CSV not found: ${SALES_CSV}`)
  }
  if (!process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI is not set')
  }

  const rows = parse(readFileSync(SALES_CSV, 'utf8'), {
    columns: true,
    relax_column_count: true,
    relax_quotes: true,
    skip_empty_lines: true,
  }) as Record<string, string>[]

  console.log(`CSV rows: ${rows.length}`)

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  console.log('Connected to Neon')

  let created = 0
  let skipped = 0

  for (const row of rows) {
    if (row['Draft'] === 'true') {
      skipped++
      continue
    }

    const slug = row['Slug']?.trim()
    const title = row['Name']?.trim()
    if (!slug || !title) {
      skipped++
      continue
    }

    const existing = await client.query(`SELECT id FROM properties_sale WHERE slug = $1 LIMIT 1`, [slug])
    if (existing.rows.length > 0) {
      console.log(`Skip (exists): ${title}`)
      skipped++
      continue
    }

    const price = row['Property Price']?.trim() || ''
    if (!price) {
      console.log(`Skip (no price): ${title}`)
      skipped++
      continue
    }

    await client.query(
      `
      INSERT INTO properties_sale (
        title, slug, intro_text, property_type, bedrooms, bathrooms,
        location, price, description, features, tenure, featured,
        video_url, status, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,
        $13,$14, NOW(), NOW()
      )
      `,
      [
        title,
        slug,
        row['Intro Text']?.trim() || null,
        row['Property Type']?.trim() || null,
        parseOptionalInt(row['Bedrooms']),
        parseOptionalInt(row['Bathrooms']),
        row['Location']?.trim() || null,
        price,
        stripHtml(row['Property Description'] || row['Description'] || '') || null,
        row['Features']?.trim() || null,
        row['Tenure']?.trim() || null,
        parseBool(row['Featured Property']),
        row['Property Video']?.trim() || null,
        'Available',
      ],
    )

    created++
    console.log(`Created: ${title}`)
  }

  const count = await client.query(`SELECT COUNT(*)::int AS n FROM properties_sale`)
  await client.end()

  console.log(`Import complete. Created: ${created}, skipped: ${skipped}, total in DB: ${count.rows[0].n}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

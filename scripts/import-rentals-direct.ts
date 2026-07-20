/**
 * Import rentals from Webflow CSV directly into Neon Postgres.
 * Leaves images empty for admin upload later.
 * Bypasses Payload local API (more reliable for bulk insert).
 */

import './load-env-first'
import { parse } from 'csv-parse/sync'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

const DATA_DIR = join(process.cwd(), '_data')
const RENTS_CSV = join(DATA_DIR, 'Realty Logic cms - Properties for rents - 67b5019005baccbd347c5005.csv')

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
  if (!existsSync(RENTS_CSV)) {
    throw new Error(`Rentals CSV not found: ${RENTS_CSV}`)
  }
  if (!process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI is not set')
  }

  const rows = parse(readFileSync(RENTS_CSV, 'utf8'), {
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

    const existing = await client.query(`SELECT id FROM properties_rent WHERE slug = $1 LIMIT 1`, [slug])
    if (existing.rows.length > 0) {
      console.log(`Skip (exists): ${title}`)
      skipped++
      continue
    }

    const monthlyRent = row['Monthly rent']?.trim() || row['Monthly Rent']?.trim() || ''
    if (!monthlyRent) {
      console.log(`Skip (no rent): ${title}`)
      skipped++
      continue
    }

    await client.query(
      `
      INSERT INTO properties_rent (
        title, slug, intro_text, property_type, bedrooms, bathrooms,
        status, deposit, epc_rating, location, monthly_rent, description,
        features, featured_on_front_page, video_url, address,
        families_welcome, students_allowed, pets_allowed, smokers_allowed,
        dss_allowed, couples_allowed, lift_access, no_admin_fee,
        created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,
        $17,$18,$19,$20,
        $21,$22,$23,$24,
        NOW(), NOW()
      )
      `,
      [
        title,
        slug,
        row['Intro Text']?.trim() || null,
        row['Property Type']?.trim() || null,
        parseOptionalInt(row['Bedrooms']),
        parseOptionalInt(row['Bathrooms']),
        parseBool(row['Let Agreed']) ? 'Let Agreed' : 'Available',
        row['Deposit']?.trim() || null,
        row['EPC Rating']?.trim() || null,
        row['Location']?.trim() || row['Property Address']?.trim() || null,
        monthlyRent,
        stripHtml(row['Description'] || '') || null,
        row['Features']?.trim() || null,
        parseBool(row['Featured on front page']),
        row['YouTube-Link']?.trim() || row['Matterport URL']?.trim() || null,
        row['Property Address']?.trim() || null,
        parseBool(row['Families Allowed']),
        parseBool(row['Student Friendly']),
        parseBool(row['Pets Allowed']),
        parseBool(row['Smokers Allowed']),
        false,
        true,
        false,
        false,
      ],
    )

    created++
    console.log(`Created: ${title}`)
  }

  const count = await client.query(`SELECT COUNT(*)::int AS n FROM properties_rent`)
  await client.end()

  console.log(`Import complete. Created: ${created}, skipped: ${skipped}, total in DB: ${count.rows[0].n}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

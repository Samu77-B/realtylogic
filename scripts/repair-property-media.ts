/**
 * One-off repair: empty Main Image rows + title-like slugs.
 * Run: npx tsx scripts/repair-property-media.ts
 */
import './load-env-first'
import pg from 'pg'
import { slugifyTitle } from '../lib/realty-ai/schema'

async function repairCollection(
  client: pg.Client,
  table: 'properties_rent' | 'properties_sale',
  imagesTable: 'properties_rent_images' | 'properties_sale_images',
) {
  const broken = await client.query(
    `
    SELECT p.id, p.title, p.slug, p.main_image_id
    FROM ${table} p
    LEFT JOIN media m ON m.id = p.main_image_id
    WHERE p.main_image_id IS NOT NULL AND (m.url IS NULL OR m.url = '' OR m.filename IS NULL)
    `,
  )

  for (const row of broken.rows) {
    const first = await client.query(
      `
      SELECT i.image_id, m.url
      FROM ${imagesTable} i
      JOIN media m ON m.id = i.image_id
      WHERE i._parent_id = $1 AND m.url IS NOT NULL AND m.url <> ''
      ORDER BY i._order
      LIMIT 1
      `,
      [row.id],
    )
    if (first.rows.length === 0) {
      console.log(`SKIP ${table}#${row.id} — no gallery image to use as main`)
      continue
    }
    await client.query(
      `UPDATE ${table} SET main_image_id = $1, main_image_url = $2, updated_at = NOW() WHERE id = $3`,
      [first.rows[0].image_id, first.rows[0].url, row.id],
    )
    console.log(`OK ${table}#${row.id} main_image_id ${row.main_image_id} → ${first.rows[0].image_id}`)
  }

  const slugs = await client.query(`SELECT id, title, slug FROM ${table}`)
  for (const row of slugs.rows) {
    const slug = String(row.slug || '')
    if (slug && !/\s/.test(slug) && !/[^a-z0-9-]/.test(slug)) continue
    const next = slugifyTitle(row.title || slug)
    if (!next || next === slug) continue
    const clash = await client.query(`SELECT id FROM ${table} WHERE slug = $1 AND id <> $2 LIMIT 1`, [
      next,
      row.id,
    ])
    const unique = clash.rows.length ? `${next}-${row.id}` : next
    await client.query(`UPDATE ${table} SET slug = $1, updated_at = NOW() WHERE id = $2`, [unique, row.id])
    console.log(`OK ${table}#${row.id} slug → ${unique}`)
  }
}

async function main() {
  const uri = process.env.DATABASE_URI
  if (!uri) throw new Error('DATABASE_URI is not set')
  const client = new pg.Client({ connectionString: uri, ssl: { rejectUnauthorized: false } })
  await client.connect()

  await repairCollection(client, 'properties_rent', 'properties_rent_images')
  await repairCollection(client, 'properties_sale', 'properties_sale_images')

  await client.end()
  console.log('Repair complete')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

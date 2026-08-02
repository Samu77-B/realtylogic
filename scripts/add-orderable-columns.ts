/**
 * Adds Payload orderable `_order` columns and backfills keys for existing docs.
 *
 * Usage: npx tsx scripts/add-orderable-columns.ts
 */
import './load-env-first'
import pg from 'pg'
import { generateNKeysBetween } from 'payload/shared'

const TABLES = [
  { table: 'properties_rent', sort: 'created_at ASC NULLS LAST, id ASC' },
  { table: 'properties_sale', sort: 'created_at ASC NULLS LAST, id ASC' },
] as const

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  await client.query(`
    ALTER TABLE properties_rent ADD COLUMN IF NOT EXISTS _order varchar;
    ALTER TABLE properties_sale ADD COLUMN IF NOT EXISTS _order varchar;
    CREATE INDEX IF NOT EXISTS properties_rent_order_idx ON properties_rent USING btree (_order);
    CREATE INDEX IF NOT EXISTS properties_sale_order_idx ON properties_sale USING btree (_order);
  `)
  console.log('Added _order columns (if missing)')

  for (const { table, sort } of TABLES) {
    const { rows } = await client.query<{ id: number }>(
      `SELECT id FROM ${table} WHERE _order IS NULL ORDER BY ${sort}`,
    )
    if (rows.length === 0) {
      console.log(`${table}: already ordered`)
      continue
    }

    const keys = generateNKeysBetween(null, null, rows.length)
    for (let i = 0; i < rows.length; i++) {
      await client.query(`UPDATE ${table} SET _order = $1 WHERE id = $2`, [keys[i], rows[i].id])
    }
    console.log(`${table}: backfilled ${rows.length} docs`)
  }

  await client.end()
  console.log('Orderable columns ready')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

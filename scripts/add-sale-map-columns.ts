import './load-env-first'
import pg from 'pg'

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  await client.query(`
    ALTER TABLE properties_sale ADD COLUMN IF NOT EXISTS address varchar;
    ALTER TABLE properties_sale ADD COLUMN IF NOT EXISTS map_lat numeric;
    ALTER TABLE properties_sale ADD COLUMN IF NOT EXISTS map_lng numeric;
  `)
  console.log('properties_sale address/map columns ready')
  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

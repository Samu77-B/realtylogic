import './load-env-first'
import pg from 'pg'

async function main() {
  const uri = process.env.DATABASE_URI
  if (!uri) throw new Error('DATABASE_URI is not set')
  const client = new pg.Client({ connectionString: uri, ssl: { rejectUnauthorized: false } })
  await client.connect()
  const result = await client.query(`
    UPDATE media
    SET prefix = ''
    WHERE prefix IS NULL
    RETURNING id
  `)
  console.log(`Normalized ${result.rowCount} media rows with null prefix`)
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

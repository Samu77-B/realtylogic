/**
 * Add media.prefix column expected by @payloadcms/storage-vercel-blob when
 * collection prefix is configured — and backfill 'media' for existing rows.
 */
import './load-env-first'
import pg from 'pg'

const client = new pg.Client({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})
await client.connect()

await client.query(`
  ALTER TABLE media ADD COLUMN IF NOT EXISTS prefix varchar;
`)

const result = await client.query(`
  UPDATE media
  SET prefix = 'media'
  WHERE (prefix IS NULL OR prefix = '')
    AND url ILIKE '%/media/%'
  RETURNING id
`)

console.log(`Added prefix column (if missing). Backfilled ${result.rowCount} rows to prefix='media'`)
await client.end()

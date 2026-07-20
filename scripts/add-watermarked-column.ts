/**
 * Add media.watermarked column for upload watermark tracking.
 * Usage: npx tsx scripts/add-watermarked-column.ts
 */

import './load-env-first'
import pg from 'pg'

async function main() {
  if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI is not set')

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  await client.query(`
    ALTER TABLE media
    ADD COLUMN IF NOT EXISTS watermarked boolean DEFAULT false
  `)

  console.log('Added media.watermarked column (or already existed).')
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

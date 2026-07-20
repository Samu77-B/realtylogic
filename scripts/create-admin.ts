/**
 * Create or update an admin user for CMS access (property management).
 *
 * Usage:
 *   ADMIN_EMAIL=naz@realtylogic.co.uk ADMIN_PASSWORD='YourPassword' npm run create:admin
 */

import './load-env-first'
import crypto from 'crypto'
import pg from 'pg'

function generatePasswordSaltHash(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex')
  return { hash, salt }
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.')
  }
  if (!process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI is not set')
  }

  const { hash, salt } = generatePasswordSaltHash(password)

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  const existing = await client.query(`SELECT id, email FROM users WHERE lower(email) = $1 LIMIT 1`, [
    email,
  ])

  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE users SET hash = $1, salt = $2, updated_at = NOW() WHERE id = $3`,
      [hash, salt, existing.rows[0].id],
    )
    console.log(`Updated password for existing admin: ${email}`)
  } else {
    await client.query(
      `
      INSERT INTO users (email, hash, salt, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      `,
      [email, hash, salt],
    )
    console.log(`Created admin user: ${email}`)
  }

  await client.end()
  console.log('User can log in at /admin and manage properties (add/edit/delete).')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

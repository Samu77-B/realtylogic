/**
 * Initialize Payload schema and create the first admin user.
 * Run after setting DATABASE_URI in .env to your Neon pooled connection string.
 *
 * Usage: npm run init:db
 */

import './load-env-first'

process.env.PAYLOAD_DB_PUSH = 'true'

function assertDatabaseUri() {
  const uri = process.env.DATABASE_URI

  if (!uri) {
    throw new Error('DATABASE_URI is not set. Copy .env.example to .env and add your Neon connection string.')
  }

  if (uri.includes('ep-xxxx') || uri.includes('USER:PASSWORD')) {
    throw new Error(
      'DATABASE_URI still uses placeholder values. Replace it with your Neon pooled connection string from neon.tech.',
    )
  }
}

async function main() {
  console.log('Initializing Realty Logic database...')
  assertDatabaseUri()

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../payload.config'),
  ])

  const payload = await getPayload({ config })
  console.log('Connected to Postgres and Payload schema is ready.')

  const { docs: existingUsers } = await payload.find({
    collection: 'users',
    limit: 1,
  })

  if (existingUsers.length > 0) {
    console.log(`Admin user already exists: ${existingUsers[0].email}`)
    return
  }

  const email = process.env.ADMIN_EMAIL || 'admin@realtylogic.co.uk'
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'

  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
    },
  })

  console.log(`Created admin user: ${email}`)
  console.log('Change the password after first login at /admin.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

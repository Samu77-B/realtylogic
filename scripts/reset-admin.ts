/**
 * Reset admin login: deletes all users so you can create a fresh account at /admin.
 * Run: npm run reset:admin
 */

import './load-env-first'

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_ADMIN_RESET !== 'true') {
    throw new Error(
      'reset-admin is blocked in production. Set ALLOW_ADMIN_RESET=true only if you intend to delete all CMS users.',
    )
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../payload.config'),
  ])

  const payload = await getPayload({ config })

  const { docs: users } = await payload.find({
    collection: 'users',
    limit: 100,
  })

  if (users.length === 0) {
    console.log('No users found. Visit /admin to create your first account.')
    process.exit(0)
    return
  }

  for (const user of users) {
    await payload.delete({
      collection: 'users',
      id: user.id,
    })
    console.log(`Deleted user: ${user.email}`)
  }

  console.log('\nLogin reset complete. Visit /admin to create a new admin account.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

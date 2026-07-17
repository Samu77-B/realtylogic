/**
 * Reset admin login: deletes all users so you can create a fresh account at /admin.
 * Run: npm run reset:admin
 */

import './load-env-first'

async function main() {
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

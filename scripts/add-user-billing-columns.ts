/**
 * Ensure Users profile + Stripe billing columns exist (Payload postgres naming).
 * Usage: npx tsx scripts/add-user-billing-columns.ts
 */
import './load-env-first'
import pg from 'pg'

async function main() {
  if (!process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI is not set')
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  const { rows: before } = await client.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY column_name`,
  )
  console.log('users columns before:', before.map((r) => r.column_name).join(', '))

  await client.query(`
    DO $$ BEGIN
      CREATE TYPE enum_users_subscription_status AS ENUM (
        'none',
        'active',
        'trialing',
        'past_due',
        'canceled',
        'incomplete',
        'incomplete_expired',
        'unpaid',
        'paused'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE users ADD COLUMN IF NOT EXISTS name varchar;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone varchar;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_id integer;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id varchar;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id varchar;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status enum_users_subscription_status DEFAULT 'none';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamp(3) with time zone;

    DO $$ BEGIN
      ALTER TABLE users
        ADD CONSTRAINT users_profile_image_id_media_id_fk
        FOREIGN KEY (profile_image_id) REFERENCES media(id) ON DELETE SET NULL;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  const { rows: after } = await client.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY column_name`,
  )
  console.log('users columns after:', after.map((r) => r.column_name).join(', '))

  await client.end()
  console.log('User profile + billing columns ready')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

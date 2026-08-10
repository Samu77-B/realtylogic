/**
 * Add missing enquiries_id on payload_locked_documents_rels
 * (Payload expects this after Enquiries collection was added).
 *
 * Usage: npx tsx scripts/fix-locked-docs-enquiries-rel.ts
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

  const { rows: cols } = await client.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = 'payload_locked_documents_rels'
     ORDER BY column_name`,
  )
  console.log(
    'payload_locked_documents_rels columns:',
    cols.map((c) => c.column_name).join(', '),
  )

  await client.query(`
    ALTER TABLE payload_locked_documents_rels
      ADD COLUMN IF NOT EXISTS enquiries_id integer;

    DO $$ BEGIN
      ALTER TABLE payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_enquiries_fk
        FOREIGN KEY (enquiries_id) REFERENCES enquiries(id) ON DELETE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
      WHEN undefined_table THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_enquiries_id_idx
      ON payload_locked_documents_rels USING btree (enquiries_id);
  `)

  const { rows: after } = await client.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = 'payload_locked_documents_rels'
     ORDER BY column_name`,
  )
  console.log(
    'After fix:',
    after.map((c) => c.column_name).join(', '),
  )

  await client.end()
  console.log('Done — refresh /admin/account')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

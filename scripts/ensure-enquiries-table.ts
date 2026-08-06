/**
 * Create enquiries table without interactive Payload drizzle push
 * (avoids deleting media.prefix).
 */
import './load-env-first'
import pg from 'pg'

const client = new pg.Client({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})
await client.connect()

await client.query(`
  DO $$ BEGIN
    CREATE TYPE enum_enquiries_listing_type AS ENUM ('rent', 'sale', 'general');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
`)

await client.query(`
  DO $$ BEGIN
    CREATE TYPE enum_enquiries_source AS ENUM ('viewing', 'contact');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
`)

await client.query(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id serial PRIMARY KEY,
    name varchar NOT NULL,
    email varchar NOT NULL,
    phone varchar,
    message varchar,
    preferred_date varchar,
    preferred_time varchar,
    property_title varchar,
    property_slug varchar,
    listing_type enum_enquiries_listing_type NOT NULL DEFAULT 'general',
    source enum_enquiries_source NOT NULL DEFAULT 'contact',
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
  );
`)

const count = await client.query(`SELECT COUNT(*)::int AS n FROM enquiries`)
console.log(`enquiries table ready (${count.rows[0].n} rows)`)
await client.end()

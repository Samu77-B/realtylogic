import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Agents } from './collections/Agents'
import { PropertiesSale } from './collections/PropertiesSale'
import { PropertiesRent } from './collections/PropertiesRent'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, 'app'),
    },
    components: {
      graphics: {
        Logo: '@/app/(payload)/admin/graphics/Logo#Logo',
        Icon: '@/app/(payload)/admin/graphics/Icon#Icon',
      },
    },
  },
  collections: [Users, Media, Agents, PropertiesSale, PropertiesRent],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'change-me-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
      // Required for Supabase Postgres connections from serverless hosts like Vercel.
      ssl: process.env.DATABASE_URI?.includes('supabase')
        ? { rejectUnauthorized: false }
        : undefined,
      max: 1,
    },
  }),
  sharp,
})

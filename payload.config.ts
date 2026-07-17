import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Agents } from './collections/Agents'
import { PropertiesSale } from './collections/PropertiesSale'
import { PropertiesRent } from './collections/PropertiesRent'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function getPostgresSsl(connectionString: string | undefined) {
  if (!connectionString) return undefined

  const requiresSsl =
    connectionString.includes('supabase') ||
    connectionString.includes('neon.tech') ||
    connectionString.includes('sslmode=require')

  return requiresSsl ? { rejectUnauthorized: false } : undefined
}

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
      ssl: getPostgresSsl(process.env.DATABASE_URI),
      max: 5,
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 20000,
    },
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  ],
  sharp,
})

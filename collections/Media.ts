import type { CollectionBeforeChangeHook, CollectionAfterReadHook, CollectionConfig } from 'payload'
import { put } from '@vercel/blob'
import { applyRealtyLogicWatermark } from '@/lib/media/watermark'
import { getMediaUrl } from '@/lib/media/getMediaUrl'

type IncomingFile = {
  data?: Buffer
  mimetype?: string
  name?: string
  size?: number
}

async function watermarkIncomingFile(req: {
  file?: IncomingFile
  context?: Record<string, unknown>
}): Promise<boolean> {
  if (req.context?.skipWatermark) return false
  const file = req.file
  if (!file?.data || !Buffer.isBuffer(file.data)) return false
  if (!String(file.mimetype || '').startsWith('image/')) return false

  const watermarked = await applyRealtyLogicWatermark(file.data)
  file.data = watermarked
  file.size = watermarked.length
  file.mimetype = 'image/jpeg'
  if (typeof file.name === 'string' && file.name) {
    file.name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  }
  return true
}

/** Client uploads land with a Blob URL but no req.file — watermark before the DB row is written. */
const watermarkClientBlobUrl: CollectionBeforeChangeHook = async ({ data, operation, context, req }) => {
  if (context?.skipWatermark || !data) return data
  if (data.watermarked) return data
  if (operation !== 'create' && operation !== 'update') return data

  const url = typeof data.url === 'string' ? data.url : ''
  if (!url || !url.includes('blob.vercel-storage.com')) return data

  // Server-side uploads are watermarked on req.file in beforeOperation
  if (req.file?.data) return data

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return data

  try {
    const res = await fetch(url)
    if (!res.ok) return data
    const input = Buffer.from(await res.arrayBuffer())
    const watermarked = await applyRealtyLogicWatermark(input)
    const base =
      (typeof data.filename === 'string' && data.filename.replace(/\.[^.]+$/, '')) || `media-${Date.now()}`
    const blob = await put(`media/wm-${base}.jpg`, watermarked, {
      access: 'public',
      token,
      contentType: 'image/jpeg',
      addRandomSuffix: true,
    })

    data.url = blob.url
    data.watermarked = true
    data.mimeType = 'image/jpeg'
    data.filesize = watermarked.length
    if (typeof data.filename === 'string') {
      data.filename = blob.pathname.split('/').pop() || data.filename
    }
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'Failed to watermark client-uploaded media URL' })
  }

  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    // Allow Media rows when the file was uploaded to Blob on the client (URL-only create)
    filesRequiredOnCreate: false,
  },
  hooks: {
    beforeOperation: [
      async ({ args, operation, req }) => {
        if (operation !== 'create' && operation !== 'update') return args
        try {
          const applied = await watermarkIncomingFile(req)
          if (applied && args.data && typeof args.data === 'object') {
            ;(args.data as { watermarked?: boolean }).watermarked = true
          }
        } catch (error) {
          req.payload.logger.error({ err: error, msg: 'Failed to watermark incoming media file' })
        }
        return args
      },
    ],
    beforeChange: [watermarkClientBlobUrl],
    afterRead: [
      (({ doc }) => {
        if (!doc) return doc
        const fixed = getMediaUrl(doc)
        if (fixed) doc.url = fixed
        return doc
      }) as CollectionAfterReadHook,
    ],
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (!data.alt || String(data.alt).trim() === '') {
          const fromName =
            typeof data.filename === 'string'
              ? data.filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
              : ''
          data.alt = fromName.trim() || 'Property image'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      defaultValue: 'Property image',
      admin: {
        description: 'Short description of the image (auto-filled from filename if blank)',
      },
    },
    {
      name: 'watermarked',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Set automatically after Realty Logic house watermark is applied',
      },
    },
  ],
}

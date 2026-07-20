import type { CollectionConfig } from 'payload'
import { put } from '@vercel/blob'
import { applyRealtyLogicWatermark } from '@/lib/media/watermark'

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
  },
  hooks: {
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
    afterChange: [
      async ({ doc, req, context }) => {
        if (context?.skipWatermark) return doc
        if (doc.watermarked) return doc
        if (!doc.url || typeof doc.url !== 'string') return doc
        if (!process.env.BLOB_READ_WRITE_TOKEN) return doc

        try {
          const res = await fetch(doc.url)
          if (!res.ok) return doc
          const input = Buffer.from(await res.arrayBuffer())
          const watermarked = await applyRealtyLogicWatermark(input)
          const base =
            (typeof doc.filename === 'string' && doc.filename.replace(/\.[^.]+$/, '')) || `media-${doc.id}`
          const pathname = `media/wm-${base}.jpg`

          const blob = await put(pathname, watermarked, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            contentType: 'image/jpeg',
            addRandomSuffix: true,
          })

          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              url: blob.url,
              watermarked: true,
              mimeType: 'image/jpeg',
              filesize: watermarked.length,
            },
            overrideAccess: true,
            context: { skipWatermark: true },
          })
        } catch (error) {
          req.payload.logger.error({ err: error, msg: 'Failed to watermark media' })
        }

        return doc
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
        description: 'Set automatically after Realty Logic watermark is applied',
      },
    },
  ],
}

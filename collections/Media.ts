import type { CollectionAfterReadHook, CollectionConfig } from 'payload'
import { getMediaUrl } from '@/lib/media/getMediaUrl'

/**
 * Property photos are NOT baked with a watermark anymore.
 * The site shows a small CSS logo overlay so object-cover never clips it.
 */
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
    afterRead: [
      (({ doc }) => {
        if (!doc) return doc
        const fixed = getMediaUrl(doc)
        if (fixed) {
          doc.url = fixed
          doc.thumbnailURL = fixed
        }
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
        description: 'Legacy flag — photos use a CSS logo overlay instead of a baked watermark',
      },
    },
  ],
}

import type { CollectionAfterReadHook, CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { blobUrlWithMediaFolder, getMediaUrl } from '@/lib/media/getMediaUrl'

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
    beforeChange: [
      (({ data, originalDoc, operation }) => {
        if (!data) return data

        const fileChanged =
          operation === 'create' ||
          (typeof data.filename === 'string' && data.filename !== originalDoc?.filename) ||
          (typeof data.url === 'string' && data.url !== originalDoc?.url)

        // Client uploads always go under the plugin prefix `media/`. Replacing a
        // photo on an old root-prefix row used to keep prefix '' and write a 404 URL.
        if (fileChanged) {
          data.prefix = 'media'
          if (typeof data.url === 'string' && data.url.trim()) {
            data.url = blobUrlWithMediaFolder(data.url)
          }
        }

        return data
      }) as CollectionBeforeChangeHook,
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

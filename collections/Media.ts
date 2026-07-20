import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ['image/*'],
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
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      defaultValue: 'Property image',
      admin: {
        description: 'Short description of the image (auto-filled if left blank)',
      },
    },
  ],
}

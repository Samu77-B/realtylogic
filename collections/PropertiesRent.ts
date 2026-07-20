import type { CollectionConfig } from 'payload'

export const PropertiesRent: CollectionConfig = {
  slug: 'properties-rent',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'monthlyRent', 'featuredOnFrontPage'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier',
      },
    },
    {
      name: 'introText',
      type: 'textarea',
    },
    {
      name: 'propertyType',
      type: 'text',
    },
    {
      name: 'bedrooms',
      type: 'number',
    },
    {
      name: 'bathrooms',
      type: 'number',
    },
    {
      name: 'receptions',
      type: 'number',
      admin: {
        description: 'Number of reception rooms',
      },
    },
    {
      name: 'status',
      type: 'text',
      admin: {
        description: 'e.g. Let Agreed, Available, Under Offer',
      },
    },
    {
      name: 'deposit',
      type: 'text',
      admin: {
        description: 'e.g. £5,000',
      },
    },
    {
      name: 'holdingFee',
      type: 'text',
      admin: {
        description: 'e.g. £500',
      },
    },
    {
      name: 'noAdminFee',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'epcRating',
      type: 'text',
      admin: {
        description: 'Energy Performance Certificate rating (e.g. B, C)',
      },
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'monthlyRent',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. £2,500 pcm',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'mainImageUrl',
      type: 'text',
      admin: {
        description: 'Placeholder or external image URL when no upload',
      },
    },
    {
      name: 'images',
      type: 'array',
      labels: {
        singular: 'Image',
        plural: 'Gallery Images',
      },
      admin: {
        description: 'Add rows only after each photo is uploaded. Empty rows block Save.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          // Soft requirement — empty gallery rows were causing Save to fail with a generic error
          required: false,
        },
      ],
    },
    {
      name: 'floorPlan',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: 'YouTube, Vimeo, or direct video URL (e.g. https://www.youtube.com/watch?v=...)',
      },
    },
    {
      name: 'features',
      type: 'textarea',
    },
    {
      name: 'featuredOnFrontPage',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
    },
    {
      name: 'familiesWelcome',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'studentsAllowed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'petsAllowed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'smokersAllowed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'dssAllowed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'couplesAllowed',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'liftAccess',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'mapLat',
      type: 'number',
    },
    {
      name: 'mapLng',
      type: 'number',
    },
    {
      name: 'address',
      type: 'text',
      admin: {
        description: 'Full address for map display',
      },
    },
  ],
}

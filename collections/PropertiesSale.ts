import type { CollectionConfig } from 'payload'

export const PropertiesSale: CollectionConfig = {
  slug: 'properties-sale',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'price', 'featured'],
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
        description: 'e.g. Sold, Under Offer, Available',
      },
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'price',
      type: 'text',
      required: true,
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
      name: 'tenure',
      type: 'text',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
    },
  ],
}

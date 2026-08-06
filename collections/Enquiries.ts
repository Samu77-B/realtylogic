import type { CollectionConfig } from 'payload'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'source', 'listingType', 'createdAt'],
    description: 'Contact and viewing enquiries from the website',
  },
  access: {
    // Public creates go through /api/enquiry with overrideAccess
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'preferredDate',
      type: 'text',
      admin: {
        description: 'ISO date string from the viewing form',
      },
    },
    {
      name: 'preferredTime',
      type: 'text',
    },
    {
      name: 'propertyTitle',
      type: 'text',
    },
    {
      name: 'propertySlug',
      type: 'text',
    },
    {
      name: 'listingType',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'Rent', value: 'rent' },
        { label: 'Sale', value: 'sale' },
        { label: 'General', value: 'general' },
      ],
      required: true,
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'contact',
      options: [
        { label: 'Viewing enquiry', value: 'viewing' },
        { label: 'Contact page', value: 'contact' },
      ],
      required: true,
    },
  ],
  timestamps: true,
}

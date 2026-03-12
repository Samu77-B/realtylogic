import type { CollectionConfig } from 'payload'

export const Agents: CollectionConfig = {
  slug: 'agents',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g. david, naz, rl-agent)',
      },
    },
    {
      name: 'profilePhoto',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'profilePhotoUrl',
      type: 'text',
      admin: {
        description: 'Placeholder or external image URL when no upload',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
    },
  ],
}

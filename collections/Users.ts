import type { CollectionConfig, FieldAccess } from 'payload'

/** Billing fields are set only by Stripe webhooks / checkout (overrideAccess). */
const billingWriteLocked: FieldAccess = () => false

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'subscriptionStatus', 'updatedAt'],
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 60 * 60 * 8,
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    // Staff can edit their own profile; billing fields are locked separately
    update: ({ req: { user } }) => (user ? { id: { equals: user.id } } : false),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Display name shown on your account',
      },
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile photo for your CMS account',
      },
    },
    {
      name: 'billingActions',
      type: 'ui',
      admin: {
        components: {
          Field: '@/app/(payload)/admin/components/BillingActions#BillingActions',
        },
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      access: {
        create: billingWriteLocked,
        update: billingWriteLocked,
      },
      admin: {
        readOnly: true,
        description: 'Stripe Customer ID (set automatically)',
      },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      access: {
        create: billingWriteLocked,
        update: billingWriteLocked,
      },
      admin: {
        readOnly: true,
        description: 'Stripe Subscription ID (set automatically)',
      },
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      defaultValue: 'none',
      access: {
        create: billingWriteLocked,
        update: billingWriteLocked,
      },
      options: [
        { label: 'None', value: 'none' },
        { label: 'Active', value: 'active' },
        { label: 'Trialing', value: 'trialing' },
        { label: 'Past due', value: 'past_due' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Incomplete', value: 'incomplete' },
        { label: 'Incomplete expired', value: 'incomplete_expired' },
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paused', value: 'paused' },
      ],
      admin: {
        readOnly: true,
        description: 'CMS subscription status (£25/month via Stripe)',
      },
    },
    {
      name: 'subscriptionCurrentPeriodEnd',
      type: 'date',
      access: {
        create: billingWriteLocked,
        update: billingWriteLocked,
      },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Current billing period end',
      },
    },
    {
      name: 'billingReminderSentAt',
      type: 'date',
      access: {
        create: billingWriteLocked,
        update: billingWriteLocked,
      },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Last weekly “set up payment” reminder email',
      },
    },
  ],
}

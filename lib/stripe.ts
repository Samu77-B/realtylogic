import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export type BillingPlan = 'monthly' | 'yearly'

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

export function getStripePriceId(plan: BillingPlan = 'monthly'): string {
  if (plan === 'yearly') {
    const yearly = process.env.STRIPE_PRICE_ID_YEARLY
    if (!yearly) {
      throw new Error('STRIPE_PRICE_ID_YEARLY is not set')
    }
    return yearly
  }

  const monthly = process.env.STRIPE_PRICE_ID
  if (!monthly) {
    throw new Error('STRIPE_PRICE_ID is not set')
  }
  return monthly
}

export function parseBillingPlan(value: unknown): BillingPlan {
  return value === 'yearly' ? 'yearly' : 'monthly'
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    'http://localhost:3000'
  )
}

/** User-safe message for admin checkout failures (details still logged server-side). */
export function publicBillingError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('STRIPE_SECRET_KEY')) {
      return 'Stripe is not configured on the server (missing STRIPE_SECRET_KEY).'
    }
    if (err.message.includes('STRIPE_PRICE_ID_YEARLY')) {
      return 'Yearly billing is not configured (missing STRIPE_PRICE_ID_YEARLY).'
    }
    if (err.message.includes('STRIPE_PRICE_ID')) {
      return 'Monthly billing is not configured (missing STRIPE_PRICE_ID).'
    }
  }

  if (err instanceof Stripe.errors.StripeAuthenticationError) {
    if (err.code === 'api_key_expired') {
      return 'Stripe secret key has expired — update STRIPE_SECRET_KEY in Vercel with a new key from the Stripe dashboard.'
    }
    return 'Stripe authentication failed — check STRIPE_SECRET_KEY on the server.'
  }

  if (err instanceof Stripe.errors.StripeError) {
    if (err.code === 'resource_missing') {
      return 'Stripe price ID not found — check STRIPE_PRICE_ID / STRIPE_PRICE_ID_YEARLY match the same Stripe account as STRIPE_SECRET_KEY.'
    }
    return err.message
  }

  return 'Checkout failed. Please try again or contact support.'
}

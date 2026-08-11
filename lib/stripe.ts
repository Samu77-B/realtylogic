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

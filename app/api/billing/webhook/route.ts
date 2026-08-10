import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getPayloadClient } from '@/lib/payload'
import { getStripe } from '@/lib/stripe'
import type { User } from '@/payload-types'

export const runtime = 'nodejs'

type SubscriptionStatus = NonNullable<User['subscriptionStatus']>

async function findUserIdByCustomer(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  customerId: string,
  metadataUserId?: string | null,
): Promise<number | null> {
  if (metadataUserId && /^\d+$/.test(metadataUserId)) {
    return Number(metadataUserId)
  }

  const found = await payload.find({
    collection: 'users',
    where: {
      stripeCustomerId: { equals: customerId },
    },
    limit: 1,
    overrideAccess: true,
  })

  return found.docs[0]?.id ?? null
}

function periodEndIso(subscription: Stripe.Subscription): string | null {
  // Basil+ API: period lives on subscription items, not the subscription root
  const end = subscription.items?.data?.[0]?.current_period_end
  if (!end) return null
  return new Date(end * 1000).toISOString()
}

const STATUS_VALUES = new Set<string>([
  'none',
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused',
])

function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  return (STATUS_VALUES.has(status) ? status : 'none') as SubscriptionStatus
}

async function syncSubscription(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  subscription: Stripe.Subscription,
) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const userId = await findUserIdByCustomer(
    payload,
    customerId,
    subscription.metadata?.payloadUserId,
  )

  if (!userId) {
    console.warn('[billing/webhook] No user for customer', customerId)
    return
  }

  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: mapStatus(subscription.status),
      subscriptionCurrentPeriodEnd: periodEndIso(subscription),
    },
    overrideAccess: true,
  })
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[billing/webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const body = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[billing/webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id

        if (!customerId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = await findUserIdByCustomer(
          payload,
          customerId,
          session.metadata?.payloadUserId || session.client_reference_id,
        )

        if (!userId) {
          console.warn('[billing/webhook] No user for checkout session', session.id)
          break
        }

        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: mapStatus(subscription.status),
            subscriptionCurrentPeriodEnd: periodEndIso(subscription),
          },
          overrideAccess: true,
        })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(payload, subscription)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[billing/webhook] handler error', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

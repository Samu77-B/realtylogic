import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { getAppBaseUrl, getStripe, getStripePriceId, parseBillingPlan } from '@/lib/stripe'

export async function POST(request: Request) {
  const auth = await getAdminUser(request.headers)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { payload, user } = auth

  try {
    const body = (await request.json().catch(() => ({}))) as { plan?: unknown }
    const plan = parseBillingPlan(body.plan)
    const stripe = getStripe()
    const priceId = getStripePriceId(plan)
    const baseUrl = getAppBaseUrl()

    let customerId = user.stripeCustomerId || undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          payloadUserId: String(user.id),
        },
      })
      customerId = customer.id
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          stripeCustomerId: customerId,
        },
        overrideAccess: true,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/admin/account?billing=success`,
      cancel_url: `${baseUrl}/admin/account?billing=cancelled`,
      client_reference_id: String(user.id),
      metadata: {
        payloadUserId: String(user.id),
        plan,
      },
      subscription_data: {
        metadata: {
          payloadUserId: String(user.id),
          plan,
        },
      },
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[billing/checkout]', err)
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

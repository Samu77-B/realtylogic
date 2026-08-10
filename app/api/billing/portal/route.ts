import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { getAppBaseUrl, getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const auth = await getAdminUser(request.headers)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = auth

  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No Stripe customer yet. Subscribe first.' },
      { status: 400 },
    )
  }

  try {
    const stripe = getStripe()
    const baseUrl = getAppBaseUrl()

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/admin/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[billing/portal]', err)
    const message = err instanceof Error ? err.message : 'Portal session failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

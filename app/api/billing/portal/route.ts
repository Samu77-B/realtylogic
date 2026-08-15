import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { getAppBaseUrl, getStripe } from '@/lib/stripe'
import { jsonError } from '@/lib/security'

export async function POST(request: Request) {
  const auth = await getAdminUser(request.headers)
  if (!auth) {
    return jsonError(401, 'Unauthorized')
  }

  const { user } = auth

  if (!user.stripeCustomerId) {
    return jsonError(400, 'No Stripe customer yet. Subscribe first.')
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
    return jsonError(500, 'Portal session failed', err)
  }
}

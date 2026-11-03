import { Resend } from 'resend'
import type Stripe from 'stripe'
import type { User } from '@/payload-types'
import { getAppBaseUrl } from '@/lib/stripe'

function formatMoney(amountMinor: number | null | undefined, currency: string | null | undefined): string {
  if (amountMinor == null) return ''
  const code = (currency || 'gbp').toUpperCase()
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code }).format(amountMinor / 100)
}

function planLabel(plan: string | undefined): string {
  if (plan === 'yearly') return 'Yearly (£250 — 2 months free)'
  return 'Monthly (£25/month)'
}

export async function sendPaymentConfirmationEmail(params: {
  user: User
  session: Stripe.Checkout.Session
  subscription: Stripe.Subscription
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey || !params.user.email) {
    return
  }

  const from =
    process.env.ENQUIRY_FROM_EMAIL?.trim() || 'Realty Logic <contact@realtylogic.co.uk>'
  const accountUrl = `${getAppBaseUrl().replace(/\/$/, '')}/admin/account`
  const firstName = (params.user.name || '').trim().split(/\s+/)[0] || 'there'
  const plan = params.session.metadata?.plan
  const amount = formatMoney(params.session.amount_total, params.session.currency)
  const periodEnd = params.subscription.items?.data?.[0]?.current_period_end
  const renews = periodEnd
    ? new Date(periodEnd * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const lines = [
    `Hi ${firstName},`,
    '',
    'Thank you — your Realty Logic CMS subscription payment was successful.',
    '',
    `Plan: ${planLabel(plan)}`,
  ]
  if (amount) lines.push(`Amount paid: ${amount}`)
  if (renews) lines.push(`Current period ends: ${renews}`)
  lines.push(
    '',
    accountUrl,
    '',
    'Invoices and receipts are also available in Stripe from Your Account → Manage billing.',
    '',
    '— Realty Logic',
  )

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: [params.user.email],
    subject: 'Realty Logic CMS — payment received',
    text: lines.join('\n'),
  })

  if (error) {
    console.error('[billing] payment confirmation email failed', params.user.id, error)
  }
}

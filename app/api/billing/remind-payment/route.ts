import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getPayloadClient } from '@/lib/payload'
import { getAppBaseUrl } from '@/lib/stripe'
import { jsonError } from '@/lib/security'
import type { User } from '@/payload-types'

export const runtime = 'nodejs'
export const maxDuration = 60

const REMIND_AFTER_MS = 6 * 24 * 60 * 60 * 1000
const PAGE_SIZE = 50
const SKIP_STATUSES = new Set(['active', 'trialing'])

function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false

  const header = request.headers.get('authorization') || ''
  const expected = `Bearer ${secret}`
  const a = Buffer.from(header)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function reminderText(user: User, accountUrl: string): string {
  const firstName = (user.name || '').trim().split(/\s+/)[0] || 'there'
  return [
    `Hi ${firstName},`,
    '',
    'Your Realty Logic CMS account does not have an active subscription yet.',
    'Please log in and set up a payment method — £25 per month, or £250 per year (2 months free).',
    '',
    accountUrl,
    '',
    'Once set up, Stripe will charge automatically each billing period. You can update or cancel anytime from Your Account → Manage billing.',
    '',
    '— Realty Logic',
  ].join('\n')
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return jsonError(401, 'Unauthorized')
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return jsonError(500, 'RESEND_API_KEY is not set')
  }

  const from =
    process.env.ENQUIRY_FROM_EMAIL?.trim() || 'Realty Logic <contact@realtylogic.co.uk>'
  const accountUrl = `${getAppBaseUrl().replace(/\/$/, '')}/admin/account`
  const cutoff = new Date(Date.now() - REMIND_AFTER_MS).toISOString()

  const payload = await getPayloadClient()
  const resend = new Resend(apiKey)

  const attempted = new Set<number>()
  let sent = 0
  let skipped = 0
  let failed = 0

  try {
    while (true) {
      const result = await payload.find({
        collection: 'users',
        where: {
          and: [
            {
              not: {
                or: [
                  { subscriptionStatus: { equals: 'active' } },
                  { subscriptionStatus: { equals: 'trialing' } },
                ],
              },
            },
            {
              or: [
                { billingReminderSentAt: { exists: false } },
                { billingReminderSentAt: { less_than: cutoff } },
              ],
            },
          ],
        },
        limit: PAGE_SIZE,
        page: 1,
        overrideAccess: true,
      })

      const batch = result.docs.filter((user) => !attempted.has(user.id))
      if (batch.length === 0) break

      for (const user of batch) {
        attempted.add(user.id)

        if (!user.email || SKIP_STATUSES.has(user.subscriptionStatus || 'none')) {
          skipped += 1
          continue
        }

        const { error } = await resend.emails.send({
          from,
          to: [user.email],
          subject: 'Set up your Realty Logic CMS payment',
          text: reminderText(user, accountUrl),
        })

        if (error) {
          failed += 1
          console.error('[billing/remind-payment] Resend error', user.id, error)
          continue
        }

        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            billingReminderSentAt: new Date().toISOString(),
          },
          overrideAccess: true,
        })
        sent += 1
      }
    }
  } catch (err) {
    return jsonError(500, 'Reminder job failed', err)
  }

  return NextResponse.json({ ok: true, sent, skipped, failed })
}

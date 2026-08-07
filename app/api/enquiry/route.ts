import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const maxDuration = 30

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
  preferredDate: z.string().trim().max(40).optional().or(z.literal('')),
  preferredTime: z.string().trim().max(40).optional().or(z.literal('')),
  propertyTitle: z.string().trim().max(300).optional().or(z.literal('')),
  propertySlug: z.string().trim().max(300).optional().or(z.literal('')),
  listingType: z.enum(['rent', 'sale', 'general']).default('general'),
  source: z.enum(['viewing', 'contact']).default('contact'),
  /** Honeypot — bots fill this; humans leave empty */
  company: z.string().optional().or(z.literal('')),
})

function officeNotificationText(data: z.infer<typeof enquirySchema>): string {
  return [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    `Source: ${data.source}`,
    `Listing type: ${data.listingType}`,
    data.propertyTitle ? `Property: ${data.propertyTitle}` : null,
    data.propertySlug ? `Slug: ${data.propertySlug}` : null,
    data.preferredDate ? `Preferred date: ${data.preferredDate}` : null,
    data.preferredTime ? `Preferred time: ${data.preferredTime}` : null,
    '',
    'Message:',
    data.message || '(none)',
  ]
    .filter((line) => line !== null)
    .join('\n')
}

function autoReplyText(data: z.infer<typeof enquirySchema>): string {
  const firstName = data.name.split(/\s+/)[0] || data.name
  const propertyLine = data.propertyTitle
    ? `\nProperty: ${data.propertyTitle}`
    : ''
  const whenLines = [
    data.preferredDate ? `Preferred date: ${data.preferredDate}` : null,
    data.preferredTime ? `Preferred time: ${data.preferredTime}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  if (data.source === 'viewing') {
    return [
      `Hi ${firstName},`,
      '',
      'Thank you for your viewing enquiry with Realty Logic.',
      'We have received your request and a member of the team will be in touch shortly to confirm.',
      propertyLine.trim() || null,
      whenLines || null,
      '',
      'If you need us sooner, call 020 7459 4097 or reply to this email.',
      '',
      'Kind regards,',
      'Realty Logic',
      '167-169 Great Portland Street, London W1W 5PF',
      'https://realtylogic.co.uk',
    ]
      .filter((line) => line !== null)
      .join('\n')
  }

  return [
    `Hi ${firstName},`,
    '',
    'Thank you for contacting Realty Logic.',
    'We have received your message and will get back to you as soon as possible.',
    '',
    'If your enquiry is urgent, call 020 7459 4097 or reply to this email.',
    '',
    'Kind regards,',
    'Realty Logic',
    '167-169 Great Portland Street, London W1W 5PF',
    'https://realtylogic.co.uk',
  ].join('\n')
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form fields and try again.', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const data = parsed.data
  if (data.company && data.company.trim() !== '') {
    // Silent success for bots
    return NextResponse.json({ ok: true })
  }

  try {
    const payload = await getPayloadClient()

    await payload.create({
      collection: 'enquiries',
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        message: data.message || undefined,
        preferredDate: data.preferredDate || undefined,
        preferredTime: data.preferredTime || undefined,
        propertyTitle: data.propertyTitle || undefined,
        propertySlug: data.propertySlug || undefined,
        listingType: data.listingType,
        source: data.source,
      },
      overrideAccess: true,
    })

    const to = process.env.ENQUIRY_TO_EMAIL?.trim() || 'contact@realtylogic.co.uk'
    const from =
      process.env.ENQUIRY_FROM_EMAIL?.trim() || 'Realty Logic <contact@realtylogic.co.uk>'
    const apiKey = process.env.RESEND_API_KEY?.trim()

    if (apiKey) {
      const resend = new Resend(apiKey)
      const officeSubject =
        data.source === 'viewing'
          ? `Viewing enquiry: ${data.propertyTitle || data.propertySlug || 'Property'}`
          : `Website contact from ${data.name}`

      const autoSubject =
        data.source === 'viewing'
          ? 'We received your viewing enquiry — Realty Logic'
          : 'We received your message — Realty Logic'

      const [officeResult, autoResult] = await Promise.all([
        resend.emails.send({
          from,
          to: [to],
          replyTo: data.email,
          subject: officeSubject,
          text: officeNotificationText(data),
        }),
        resend.emails.send({
          from,
          to: [data.email],
          replyTo: to,
          subject: autoSubject,
          text: autoReplyText(data),
        }),
      ])

      if (officeResult.error) {
        console.error('Resend office notification error:', officeResult.error)
      }
      if (autoResult.error) {
        console.error('Resend auto-reply error:', autoResult.error)
      }
    } else {
      console.warn('RESEND_API_KEY not set — enquiry saved to admin only')
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Enquiry failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not send enquiry' },
      { status: 500 },
    )
  }
}

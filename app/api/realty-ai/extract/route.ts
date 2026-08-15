import { generateObject } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { propertyDraftSchema, type PropertyDraft } from '@/lib/realty-ai/schema'
import { jsonError, rateLimit } from '@/lib/security'

export const maxDuration = 60

const SYSTEM = `You are Realty AI, a property listing assistant for Realty Logic UK estate agents.
Your job is to help managers capture rental or sale listing details from spoken or typed notes.

Rules:
- Extract structured fields carefully from the conversation.
- Prefer British English and UK rent/price formatting (£ and pcm for rent).
- If listing type is unclear, default to rent.
- Do not invent prices, addresses, or EPC ratings — leave optional fields empty if unknown.
- Set readyToPublish true only when title is present AND (monthlyRent for rent OR price for sale).
- Keep assistantMessage short, friendly, and actionable (what you captured + what is still missing).
- If the manager says they want to publish, still return the best current draft; publishing is handled separately.`

const extractBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(8000),
      }),
    )
    .min(1)
    .max(40),
  currentDraft: propertyDraftSchema.partial().nullable().optional(),
})

export async function POST(request: Request) {
  const auth = await getAdminUser(request.headers)
  if (!auth) {
    return jsonError(401, 'Please log in at /admin first.')
  }

  if (!rateLimit(`realty-ai:${auth.user.id}`, 20, 60 * 1000)) {
    return jsonError(429, 'Too many AI requests. Please wait a moment.')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'Invalid JSON')
  }

  const parsed = extractBodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonError(400, 'Invalid request. Keep notes shorter and try again.')
  }

  const messages = parsed.data.messages
  const currentDraft = parsed.data.currentDraft as Partial<PropertyDraft> | null | undefined

  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Manager' : 'Realty AI'}: ${m.content}`)
    .join('\n')

  const current = currentDraft
    ? `\n\nCurrent draft so far (update/merge with new details):\n${JSON.stringify(currentDraft, null, 2)}`
    : ''

  try {
    const { object } = await generateObject({
      model: 'openai/gpt-4.1-mini',
      schema: propertyDraftSchema,
      prompt: `${SYSTEM}\n\nConversation:\n${transcript}${current}\n\nReturn the updated property draft.`,
    })

    return NextResponse.json({ draft: object })
  } catch (error) {
    console.error('Realty AI extract failed:', error)
    const message =
      error instanceof Error && /API key|Unauthorized|gateway/i.test(error.message)
        ? 'AI is not configured yet. Add AI Gateway access on Vercel (or AI_GATEWAY_API_KEY locally).'
        : 'Could not process those details. Please try again.'
    return jsonError(500, message)
  }
}

import { generateObject } from 'ai'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { propertyDraftSchema, type PropertyDraft } from '@/lib/realty-ai/schema'

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

type Body = {
  messages?: { role: 'user' | 'assistant'; content: string }[]
  currentDraft?: Partial<PropertyDraft> | null
}

export async function POST(request: Request) {
  const auth = await getAdminUser(request.headers)
  if (!auth) {
    return NextResponse.json({ error: 'Please log in at /admin first.' }, { status: 401 })
  }

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const messages = body.messages ?? []
  if (messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
  }

  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Manager' : 'Realty AI'}: ${m.content}`)
    .join('\n')

  const current = body.currentDraft
    ? `\n\nCurrent draft so far (update/merge with new details):\n${JSON.stringify(body.currentDraft, null, 2)}`
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
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

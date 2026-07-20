'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PropertyDraft } from '@/lib/realty-ai/schema'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

type Props = {
  userEmail: string
}

export function RealtyAIAssistant({ userEmail }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi — I’m Realty AI. Tell me about the property (or tap the mic and speak). When the draft looks right, say “Publish” or press Publish.',
    },
  ])
  const [input, setInput] = useState('')
  const [draft, setDraft] = useState<PropertyDraft | null>(null)
  const [listening, setListening] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState<{
    adminPath: string
    publicPath: string
  } | null>(null)
  const [voiceSupported, setVoiceSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const draftRef = useRef<PropertyDraft | null>(null)
  const busyRef = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    busyRef.current = busy
  }, [busy])

  useEffect(() => {
    setVoiceSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const publishDraft = useCallback(async (nextDraft: PropertyDraft) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/realty-ai/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: nextDraft }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publish failed')
      setPublished({ adminPath: data.adminPath, publicPath: data.publicPath })
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Published. You can add photos in admin, then check the live page.\nAdmin: ${data.adminPath}\nLive: ${data.publicPath}`,
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setBusy(false)
    }
  }, [])

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busyRef.current) return

      const wantsPublish = /\bpublish\b/i.test(trimmed)
      const current = draftRef.current

      if (wantsPublish && current?.readyToPublish) {
        setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
        setInput('')
        await publishDraft(current)
        return
      }

      const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
      setMessages(nextMessages)
      setInput('')
      setBusy(true)
      setError(null)
      setPublished(null)

      try {
        const res = await fetch('/api/realty-ai/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages, currentDraft: current }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'AI request failed')

        const nextDraft = data.draft as PropertyDraft
        setDraft(nextDraft)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: nextDraft.assistantMessage || 'Draft updated.' },
        ])

        if (wantsPublish && nextDraft.readyToPublish) {
          await publishDraft(nextDraft)
        } else if (wantsPublish) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content:
                'I still need required details before publishing (title plus monthly rent or sale price).',
            },
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setBusy(false)
      }
    },
    [messages, publishDraft],
  )

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }, [])

  const startListening = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Ctor) {
      setError('Voice input needs Chrome or Edge on this device.')
      return
    }

    stopListening()
    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-GB'

    let finalChunk = ''

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript
        if (event.results[i].isFinal) finalChunk += `${piece} `
        else interim += piece
      }
      setInput(`${finalChunk}${interim}`.trim())

      const combined = `${finalChunk}${interim}`.toLowerCase()
      if (/\bpublish\b/.test(combined) && draftRef.current?.readyToPublish && !busyRef.current) {
        const spoken = `${finalChunk}${interim}`.trim()
        finalChunk = ''
        stopListening()
        void sendText(spoken || 'Publish')
      }
    }

    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Voice error: ${event.error}`)
      }
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
    setError(null)
  }, [sendText, stopListening])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendText(input)
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <section className="flex min-h-[70vh] flex-col">
        <p className="text-sm text-gray-500">Signed in as {userEmail}</p>
        <h1 className="mt-2 text-3xl font-light text-gray-900" style={{ lineHeight: 1.2 }}>
          Realty AI
        </h1>
        <p className="mt-2 max-w-xl text-gray-600">
          Speak or type property details. Review the draft, then say <strong>Publish</strong> when
          you’re happy. Add photos afterwards in admin.
        </p>

        <div
          ref={listRef}
          className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-lg border border-gray-200 bg-[#f8f8f8] p-4"
        >
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`max-w-[90%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'ml-auto bg-[var(--dkgrey)] text-white'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy && <p className="text-sm text-gray-500">Realty AI is updating the draft…</p>}
        </div>

        {error && (
          <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm text-gray-700">
            Details
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="e.g. 2 bed flat in Camden, £2,500 pcm, pets allowed…"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[var(--color)]"
            />
          </label>
          <div className="flex gap-2">
            {voiceSupported && (
              <button
                type="button"
                onClick={() => (listening ? stopListening() : startListening())}
                className={`rounded px-4 py-2 text-sm font-medium text-white ${
                  listening ? 'bg-red-600' : 'bg-[var(--dkgrey)]'
                }`}
              >
                {listening ? 'Stop' : 'Mic'}
              </button>
            )}
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded bg-[var(--color)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
        {!voiceSupported && (
          <p className="mt-2 text-xs text-gray-500">
            Voice works best in Chrome or Edge. You can still type everything here.
          </p>
        )}
      </section>

      <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-light text-gray-900">Draft listing</h2>
        {!draft ? (
          <p className="mt-3 text-sm text-gray-500">Nothing captured yet.</p>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <DraftRow label="Type" value={draft.listingType === 'sale' ? 'Sale' : 'Rent'} />
            <DraftRow label="Title" value={draft.title} />
            <DraftRow label="Location" value={draft.location} />
            <DraftRow label="Address" value={draft.address} />
            <DraftRow label="Beds / baths" value={[draft.bedrooms, draft.bathrooms].filter((n) => n != null).join(' / ')} />
            <DraftRow
              label={draft.listingType === 'sale' ? 'Price' : 'Monthly rent'}
              value={draft.listingType === 'sale' ? draft.price : draft.monthlyRent}
            />
            <DraftRow label="Deposit" value={draft.deposit} />
            <DraftRow label="EPC" value={draft.epcRating} />
            <DraftRow label="Features" value={draft.features} />
            <DraftRow label="Description" value={draft.description} />
            <DraftRow
              label="Ready"
              value={draft.readyToPublish ? 'Yes — you can publish' : 'Not yet — need required fields'}
            />
          </dl>
        )}

        <button
          type="button"
          disabled={!draft?.readyToPublish || busy}
          onClick={() => draft && void publishDraft(draft)}
          className="mt-6 w-full rounded bg-[var(--dkgrey)] px-4 py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          Publish
        </button>

        {published && (
          <div className="mt-4 space-y-2 text-sm">
            <a href={published.adminPath} className="block text-[var(--color)] underline">
              Open in admin (add photos)
            </a>
            <a href={published.publicPath} className="block text-[var(--color)] underline">
              View public page
            </a>
          </div>
        )}
      </aside>
    </div>
  )
}

function DraftRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-gray-900">{value}</dd>
    </div>
  )
}

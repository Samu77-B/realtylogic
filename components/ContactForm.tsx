'use client'

import { useState } from 'react'
import Link from 'next/link'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone') || '',
          message: formData.get('message') || '',
          company: formData.get('company') || '',
          listingType: 'general',
          source: 'contact',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Could not send message')
      }
      setSubmitted(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setBusy(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Send us a message</h3>
        <p className="text-gray-600">Thank you — we&apos;ll get back to you shortly.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Send us a message</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden
        />
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="contact-name"
            name="name"
            required
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="contact-email"
            name="email"
            required
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            id="contact-phone"
            name="phone"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="contact-terms"
            name="terms"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="contact-terms" className="text-sm text-gray-600">
            I agree to the{' '}
            <Link href="/terms-conditions" className="underline hover:text-gray-900">
              terms and conditions
            </Link>
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-black py-3 font-medium uppercase tracking-wide text-white transition hover:bg-gray-800 disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'

const fieldClassName =
  'w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400'

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
      <div className="rounded-2xl bg-gray-100 p-6 sm:p-8">
        <p className="text-gray-700">Thank you — we&apos;ll get back to you shortly.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gray-100 p-6 sm:p-8">
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
          <label htmlFor="contact-name" className="sr-only">
            Your Name
          </label>
          <input
            type="text"
            id="contact-name"
            name="name"
            required
            placeholder="Your Name"
            autoComplete="name"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="sr-only">
            Your Email
          </label>
          <input
            type="email"
            id="contact-email"
            name="email"
            required
            placeholder="Your Email"
            autoComplete="email"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="sr-only">
            Your Phone Number
          </label>
          <input
            type="tel"
            id="contact-phone"
            name="phone"
            placeholder="Your Phone Number"
            autoComplete="tel"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="sr-only">
            Questions
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            required
            placeholder="Questions"
            className={`${fieldClassName} resize-y`}
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
          <label htmlFor="contact-terms" className="text-sm text-gray-500">
            I agree to the{' '}
            <Link href="/terms-conditions" className="underline hover:text-gray-800">
              terms and conditions
            </Link>
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

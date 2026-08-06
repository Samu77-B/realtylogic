'use client'

import { useState } from 'react'
import Link from 'next/link'

type ArrangeViewingFormProps = {
  propertyTitle: string
  propertySlug: string
  isRental?: boolean
}

export function ArrangeViewingForm({
  propertyTitle,
  propertySlug,
  isRental = true,
}: ArrangeViewingFormProps) {
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
          preferredDate: formData.get('preferredDate') || '',
          preferredTime: formData.get('preferredTime') || '',
          company: formData.get('company') || '',
          propertyTitle,
          propertySlug,
          listingType: isRental ? 'rent' : 'sale',
          source: 'viewing',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Could not send enquiry')
      }
      setSubmitted(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send enquiry')
    } finally {
      setBusy(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Arrange a viewing</h3>
        <p className="mt-4 text-gray-600">Thank you for your enquiry. We&apos;ll be in touch shortly.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900">Arrange a viewing</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden
        />
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="preferredDate" className="mb-1 block text-sm font-medium text-gray-700">
              Preferred date
            </label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label htmlFor="preferredTime" className="mb-1 block text-sm font-medium text-gray-700">
              Preferred time
            </label>
            <input
              type="time"
              id="preferredTime"
              name="preferredTime"
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
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
          {busy ? 'Sending…' : 'Send Enquiry'}
        </button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    // TODO: Connect to API/email service and booking calendar - preferredDate and preferredTime
    // will be validated against available slots in the admin dashboard viewing calendar
    console.log('Enquiry:', { ...data, property: propertyTitle, slug: propertySlug })
    setSubmitted(true)
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
            I agree to the terms and conditions
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-black py-3 font-medium uppercase tracking-wide text-white transition hover:bg-gray-800"
        >
          Send Enquiry
        </button>
      </form>
    </div>
  )
}

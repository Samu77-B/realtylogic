'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useAuth } from '@payloadcms/ui'
import type { User } from '@/payload-types'

const ACTIVE_STATUSES = new Set(['active', 'trialing'])
const NAZ_EMAIL = 'naz@realtylogic.co.uk'
const DISMISS_KEY = 'rl-billing-reminder-dismissed'

type CheckoutPlan = 'monthly' | 'yearly'
type BusyState = CheckoutPlan | null

function needsPaymentSetup(user: User | null | undefined): boolean {
  if (!user) return false
  return !ACTIVE_STATUSES.has(user.subscriptionStatus || 'none')
}

function firstName(user: User): string {
  return (user.name || '').trim().split(/\s+/)[0] || 'there'
}

function BillingSetupReminderModal({
  user,
  onDismiss,
}: {
  user: User
  onDismiss: () => void
}) {
  const [busy, setBusy] = useState<BusyState>(null)
  const [error, setError] = useState<string | null>(null)

  const postJson = useCallback(async (url: string, body?: Record<string, unknown>) => {
    setError(null)
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
    if (!res.ok || !data.url) {
      throw new Error(data.error || `Request failed (${res.status})`)
    }
    window.location.href = data.url
  }, [])

  const onSubscribe = async (plan: CheckoutPlan) => {
    setBusy(plan)
    try {
      await postJson('/api/billing/checkout', { plan })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout')
      setBusy(null)
    }
  }

  return (
    <div
      className="rl-billing-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rl-billing-modal-title"
      onClick={onDismiss}
    >
      <div className="rl-billing-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="rl-billing-modal__close"
          onClick={onDismiss}
          aria-label="Close"
        >
          ×
        </button>
        <div className="rl-billing">
          <div className="rl-billing__header">
            <span className="rl-billing__icon" aria-hidden />
            <div>
              <div className="rl-billing__title" id="rl-billing-modal-title">
                Hi {firstName(user)}, set up your payment
              </div>
              <p className="rl-billing__copy">
                Your CMS account does not have an active subscription yet. Please set up a payment
                method — £25 per month, or £250 per year (2 months free). Stripe will charge
                automatically each billing period, and you can update or cancel anytime from Your
                Account.
              </p>
            </div>
          </div>

          <div className="rl-billing__actions">
            <button
              type="button"
              className="btn btn--style-primary btn--size-medium rl-billing__btn"
              disabled={busy !== null}
              onClick={() => onSubscribe('monthly')}
            >
              {busy === 'monthly' ? 'Redirecting…' : 'Monthly (£25/mo)'}
            </button>
            <button
              type="button"
              className="btn btn--style-primary btn--size-medium rl-billing__btn"
              disabled={busy !== null}
              onClick={() => onSubscribe('yearly')}
            >
              {busy === 'yearly' ? 'Redirecting…' : 'Yearly (£250 — 2 months free)'}
            </button>
            <Link
              href="/admin/account"
              className="btn btn--style-secondary btn--size-medium rl-billing__btn rl-billing__btn--ghost"
              onClick={onDismiss}
            >
              Go to Your Account
            </Link>
            <button
              type="button"
              className="btn btn--style-secondary btn--size-medium rl-billing__btn rl-billing__btn--ghost"
              disabled={busy !== null}
              onClick={onDismiss}
            >
              Remind me later
            </button>
          </div>

          {error && <p className="rl-billing__error">{error}</p>}
        </div>
      </div>
    </div>
  )
}

function useBillingReminderUser() {
  const { user } = useAuth()
  const authUser = user as User | null | undefined
  const userId = authUser?.id ?? null
  const userEmail = authUser?.email?.trim().toLowerCase() ?? ''

  const [billingUser, setBillingUser] = useState<User | null>(null)

  useEffect(() => {
    if (!userId || userEmail !== NAZ_EMAIL) {
      setBillingUser(null)
      return
    }

    let cancelled = false

    const fallbackUser = authUser

    async function loadUser() {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { user?: User }
        if (!cancelled && data.user) {
          setBillingUser(data.user)
          return
        }
      } catch {
        // Fall back to auth context user below.
      }

      if (!cancelled && fallbackUser) {
        setBillingUser(fallbackUser)
      }
    }

    void loadUser()

    return () => {
      cancelled = true
    }
  }, [userId, userEmail, authUser])

  return billingUser
}

function BillingSetupReminderGate() {
  const billingUser = useBillingReminderUser()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setOpen(false)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !billingUser) {
      setOpen(false)
      return
    }

    if (billingUser.email?.trim().toLowerCase() !== NAZ_EMAIL || !needsPaymentSetup(billingUser)) {
      setOpen(false)
      return
    }

    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      setOpen(false)
      return
    }

    setOpen(true)
  }, [mounted, billingUser])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, dismiss])

  if (!mounted || !open || !billingUser) return null

  const portalRoot = document.getElementById('portal') ?? document.body
  return createPortal(
    <BillingSetupReminderModal user={billingUser} onDismiss={dismiss} />,
    portalRoot,
  )
}

/** Wraps the admin panel — shows payment reminder on every admin page after login. */
export function BillingSetupReminder({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BillingSetupReminderGate />
    </>
  )
}

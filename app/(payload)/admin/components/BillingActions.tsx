'use client'

import React, { useCallback, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

const ACTIVE_STATUSES = new Set(['active', 'trialing'])

type CheckoutPlan = 'monthly' | 'yearly'
type BusyState = CheckoutPlan | 'portal' | null

export function BillingActions() {
  const [busy, setBusy] = useState<BusyState>(null)
  const [error, setError] = useState<string | null>(null)

  const status = useFormFields(([fields]) => fields.subscriptionStatus?.value as string | undefined)
  const periodEnd = useFormFields(
    ([fields]) => fields.subscriptionCurrentPeriodEnd?.value as string | undefined,
  )
  const customerId = useFormFields(
    ([fields]) => fields.stripeCustomerId?.value as string | undefined,
  )

  const isActive = ACTIVE_STATUSES.has(status || '')
  const periodLabel = periodEnd
    ? new Date(periodEnd).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

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

  const onManage = async () => {
    setBusy('portal')
    try {
      await postJson('/api/billing/portal')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open billing portal')
      setBusy(null)
    }
  }

  return (
    <div className="rl-billing">
      <div className="rl-billing__header">
        <span className="rl-billing__icon" aria-hidden />
        <div>
          <div className="rl-billing__title">CMS subscription</div>
          <p className="rl-billing__copy">
            Choose monthly (£25) or yearly (£250 — 2 months free). Status:{' '}
            <strong>
              {status && status !== 'none' ? status.replace(/_/g, ' ') : 'not subscribed'}
            </strong>
            {periodLabel ? ` · renews/ends ${periodLabel}` : ''}
          </p>
        </div>
      </div>
      <div className="rl-billing__actions">
        {!isActive && (
          <>
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
          </>
        )}
        {customerId && (
          <button
            type="button"
            className="btn btn--style-secondary btn--size-medium rl-billing__btn rl-billing__btn--ghost"
            disabled={busy !== null}
            onClick={onManage}
          >
            {busy === 'portal' ? 'Redirecting…' : 'Manage billing'}
          </button>
        )}
      </div>
      {error && <p className="rl-billing__error">{error}</p>}
    </div>
  )
}

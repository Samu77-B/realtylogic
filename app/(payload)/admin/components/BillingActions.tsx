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
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>CMS subscription</div>
      <p style={{ margin: '0 0 0.75rem', color: 'var(--theme-elevation-800)', fontSize: 14 }}>
        Choose monthly (£25) or yearly (£250 — 2 months free). Status:{' '}
        <strong>{status && status !== 'none' ? status.replace(/_/g, ' ') : 'not subscribed'}</strong>
        {periodLabel ? ` · renews/ends ${periodLabel}` : ''}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {!isActive && (
          <>
            <button
              type="button"
              className="btn btn--style-primary btn--size-medium"
              disabled={busy !== null}
              onClick={() => onSubscribe('monthly')}
            >
              {busy === 'monthly' ? 'Redirecting…' : 'Monthly (£25/mo)'}
            </button>
            <button
              type="button"
              className="btn btn--style-primary btn--size-medium"
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
            className="btn btn--style-secondary btn--size-medium"
            disabled={busy !== null}
            onClick={onManage}
          >
            {busy === 'portal' ? 'Redirecting…' : 'Manage billing'}
          </button>
        )}
      </div>
      {error && (
        <p style={{ color: 'var(--theme-error-500)', margin: '0.75rem 0 0', fontSize: 13 }}>{error}</p>
      )}
    </div>
  )
}

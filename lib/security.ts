import { NextResponse } from 'next/server'

const buckets = new Map<string, { count: number; resetAt: number }>()

/** In-memory sliding window. Best-effort on Vercel (per instance). */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function jsonError(status: number, message: string, log?: unknown) {
  if (log !== undefined) {
    console.error(message, log)
  }
  return NextResponse.json({ error: message }, { status })
}

export function getAllowedOrigins(): string[] {
  const origins = new Set<string>([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://realtylogic.co.uk',
    'https://www.realtylogic.co.uk',
  ])

  const fromEnv = [
    process.env.NEXT_PUBLIC_SERVER_URL,
    process.env.PAYLOAD_PUBLIC_SERVER_URL,
  ]
  for (const value of fromEnv) {
    const trimmed = value?.trim().replace(/\/$/, '')
    if (trimmed) origins.add(trimmed)
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`)
  }

  return [...origins]
}

export function getPayloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET?.trim() || ''
  const insecure =
    !secret ||
    secret === 'change-me-in-production' ||
    secret === 'your-secret-key-change-in-production' ||
    secret.length < 16

  if (process.env.NODE_ENV === 'production') {
    if (insecure || secret.length < 32) {
      throw new Error(
        'PAYLOAD_SECRET must be set to a random string of at least 32 characters in production.',
      )
    }
    return secret
  }

  if (insecure) {
    console.warn(
      '[payload] PAYLOAD_SECRET is missing or weak. Set a 32+ character secret before deploying.',
    )
    return secret || 'dev-only-insecure-secret'
  }

  return secret
}

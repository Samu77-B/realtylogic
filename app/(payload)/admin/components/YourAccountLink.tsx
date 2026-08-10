'use client'

import React from 'react'
import { Link } from '@payloadcms/ui'

/**
 * Header action: “Your Account” label next to the profile avatar.
 * Opens /admin/account (profile + billing).
 */
export function YourAccountLink() {
  return (
    <Link
      href="/admin/account"
      prefetch={false}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 28,
        padding: '0 4px',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: 'var(--theme-elevation-800)',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      Your Account
    </Link>
  )
}

import type { CollectionBeforeChangeHook } from 'payload'
import { slugifyTitle } from '@/lib/realty-ai/schema'

function slugLooksInvalid(slug: string): boolean {
  return /\s/.test(slug) || /[^a-z0-9-]/.test(slug)
}

/**
 * If slug is missing or still looks like a title (spaces, £, etc.), slugify from title.
 */
export const slugifyPropertyHook: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) return data

  const title = typeof data.title === 'string' ? data.title : String(originalDoc?.title || '')
  const slug = typeof data.slug === 'string' ? data.slug.trim() : String(originalDoc?.slug || '').trim()

  if (slug && !slugLooksInvalid(slug)) return data

  const next = slugifyTitle(title || slug)
  if (next) data.slug = next

  return data
}

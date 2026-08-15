/**
 * Resolve a public URL for a Payload Media doc.
 *
 * Two layouts exist in this project:
 * - Imported Webflow photos: blob path `media/<file>`, DB `prefix = 'media'`
 * - Admin / client uploads: blob path `/<file>` at the store root, `prefix` empty
 *
 * Payload's Vercel Blob adapter rebuilds `url` from filename and can drop `media/`.
 * Only put that segment back when the file was actually stored under `media/`.
 */
export function getMediaUrl(item: unknown): string | null {
  if (typeof item !== 'object' || item === null) return null

  const media = item as { url?: string | null; filename?: string | null; prefix?: string | null }
  let url = typeof media.url === 'string' ? media.url.trim() : ''

  if (!url) return null

  const prefix = typeof media.prefix === 'string' ? media.prefix.replace(/^\/|\/$/g, '') : ''
  const storedUnderMedia = prefix === 'media'

  if (
    storedUnderMedia &&
    /\.blob\.vercel-storage\.com\//i.test(url) &&
    !/\.blob\.vercel-storage\.com\/media\//i.test(url)
  ) {
    url = url.replace(
      /^(https:\/\/[^/]+\.public\.blob\.vercel-storage\.com)\//i,
      '$1/media/',
    )
  }

  return url
}

/** Prefer a stored URL string; skip blanks so an empty `mainImageUrl` does not hide the upload. */
export function getPropertyMainImageUrl(property: {
  mainImageUrl?: string | null
  mainImage?: unknown
}): string | null {
  const direct = typeof property.mainImageUrl === 'string' ? property.mainImageUrl.trim() : ''
  if (direct) return direct
  if (typeof property.mainImage === 'object' && property.mainImage) {
    return getMediaUrl(property.mainImage)
  }
  return null
}

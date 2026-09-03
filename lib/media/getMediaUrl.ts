/**
 * Resolve a public URL for a Payload Media doc.
 *
 * Two layouts exist:
 * - Most photos (imports + new admin uploads): blob path `media/<file>`
 * - Early admin uploads: blob path `/<file>` at the store root (`prefix` empty)
 *
 * Replacing a photo on an old (root) media row uploads into `media/` but Payload
 * may keep `prefix: ''` and write a root URL — that 404s in the crop/preview UI.
 */
const BLOB_HOST = /\.public\.blob\.vercel-storage\.com/i

export function blobUrlWithMediaFolder(url: string): string {
  const trimmed = url.trim()
  if (!BLOB_HOST.test(trimmed)) return trimmed
  if (/\/media\//i.test(trimmed)) return trimmed
  return trimmed.replace(
    /^(https:\/\/[^/]+\.public\.blob\.vercel-storage\.com)\//i,
    '$1/media/',
  )
}

function filenameLooksLikeClientUpload(filename?: string | null): boolean {
  return typeof filename === 'string' && /[\s()]/.test(filename)
}

export function getMediaUrl(item: unknown): string | null {
  if (typeof item !== 'object' || item === null) return null

  const media = item as { url?: string | null; filename?: string | null; prefix?: string | null }
  let url = typeof media.url === 'string' ? media.url.trim() : ''

  if (!url) return null

  const prefix = typeof media.prefix === 'string' ? media.prefix.replace(/^\/|\/$/g, '') : ''
  const storedUnderMedia = prefix === 'media' || filenameLooksLikeClientUpload(media.filename)

  if (storedUnderMedia && BLOB_HOST.test(url) && !/\/media\//i.test(url)) {
    url = blobUrlWithMediaFolder(url)
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

/**
 * Payload's Vercel Blob adapter regenerates `media.url` from filename and often
 * drops the `media/` path prefix our uploads use, which 404s gallery images.
 */
export function getMediaUrl(item: unknown): string | null {
  if (typeof item !== 'object' || item === null) return null

  const media = item as { url?: string | null; filename?: string | null }
  let url = typeof media.url === 'string' ? media.url.trim() : ''

  if (!url) return null

  // Insert missing /media/ segment: ...blob.vercel-storage.com/<file> → .../media/<file>
  if (
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

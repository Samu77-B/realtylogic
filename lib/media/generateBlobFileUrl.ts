/**
 * Public Vercel Blob URL for a Media file.
 * Payload's adapter does path.posix.join(prefix, filename) which throws when prefix is null
 * (admin uploads stored at the bucket root).
 */
export function generateBlobFileUrl({
  filename,
  prefix,
}: {
  filename: string
  prefix?: string | null
}): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN || ''
  const storeId = token.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]?.toLowerCase()
  if (!storeId || !filename) return ''

  const baseUrl = `https://${storeId}.public.blob.vercel-storage.com`
  const folder = typeof prefix === 'string' ? prefix.replace(/^\/|\/$/g, '') : ''
  const file = encodeURIComponent(filename)

  return folder ? `${baseUrl}/${folder}/${file}` : `${baseUrl}/${file}`
}

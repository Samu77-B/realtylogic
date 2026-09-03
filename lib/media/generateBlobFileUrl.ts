/**
 * Public Vercel Blob URL for a Media file.
 * Payload's adapter does path.posix.join(prefix, filename) which throws when prefix is null
 * (legacy admin uploads stored at the bucket root).
 *
 * New client uploads use plugin prefix `media/`. Filenames with spaces (WhatsApp) always
 * land there even when the existing Media row still has an empty prefix.
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
  const fromDoc = typeof prefix === 'string' ? prefix.replace(/^\/|\/$/g, '') : ''
  const folder = fromDoc || (/[\s()]/.test(filename) ? 'media' : '')
  // encodeURI keeps () which Vercel Blob stores unencoded; encodeURIComponent would 404 some files
  const file = encodeURI(filename).replace(/#/g, '%23').replace(/\?/g, '%3F')

  return folder ? `${baseUrl}/${folder}/${file}` : `${baseUrl}/${file}`
}

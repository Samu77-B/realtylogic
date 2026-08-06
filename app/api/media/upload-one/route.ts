import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { getAdminUser } from '@/lib/realty-ai/auth'

export const maxDuration = 60
export const runtime = 'nodejs'

const MAX_BYTES = 8 * 1024 * 1024

export async function POST(request: Request) {
  const auth = await getAdminUser(request.headers)
  if (!auth) {
    return NextResponse.json({ error: 'Please log in at /admin first.' }, { status: 401 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json(
      {
        error:
          'BLOB_READ_WRITE_TOKEN is not configured. Link Vercel Blob to this project and redeploy.',
      },
      { status: 500 },
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please use files under 8MB.`,
      },
      { status: 413 },
    )
  }

  try {
    const input = Buffer.from(await file.arrayBuffer())

    // No baked watermark — frontend CSS overlay handles branding
    const normalised = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer()

    const meta = await sharp(normalised).metadata()

    const base = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '') || 'image'
    const filename = `${base}-${Date.now()}.jpg`

    const alt =
      String(form.get('alt') || '').trim() ||
      file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') ||
      'Property image'

    const blob = await put(`media/${filename}`, normalised, {
      access: 'public',
      token,
      contentType: 'image/jpeg',
      addRandomSuffix: true,
    })

    const storedFilename =
      decodeURIComponent(new URL(blob.url).pathname.split('/').pop() || '') ||
      blob.pathname.split('/').pop() ||
      filename

    const doc = await auth.payload.create({
      collection: 'media',
      data: {
        alt,
        watermarked: false,
        url: blob.url,
        filename: storedFilename,
        mimeType: 'image/jpeg',
        filesize: normalised.length,
        width: meta.width ?? undefined,
        height: meta.height ?? undefined,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      id: doc.id,
      url: (typeof doc.url === 'string' && doc.url) || blob.url,
      alt: doc.alt,
    })
  } catch (error) {
    console.error('Media upload-one failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { applyRealtyLogicWatermark } from '@/lib/media/watermark'

export const maxDuration = 60
export const runtime = 'nodejs'

const MAX_BYTES = 4.2 * 1024 * 1024 // stay under Vercel ~4.5MB body limit

export async function POST(request: Request) {
  const auth = await getAdminUser(request.headers)
  if (!auth) {
    return NextResponse.json({ error: 'Please log in at /admin first.' }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured on this deployment.' },
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
        error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Use files under ~4MB each.`,
      },
      { status: 413 },
    )
  }

  try {
    const input = Buffer.from(await file.arrayBuffer())
    const watermarked = await applyRealtyLogicWatermark(input)
    const base = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '') || 'image'
    const filename = `${base}-${Date.now()}.jpg`

    const alt =
      String(form.get('alt') || '').trim() ||
      file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') ||
      'Property image'

    // Upload watermarked bytes through Payload → Vercel Blob adapter
    const doc = await auth.payload.create({
      collection: 'media',
      data: {
        alt,
        watermarked: true,
      },
      file: {
        data: watermarked,
        mimetype: 'image/jpeg',
        name: filename,
        size: watermarked.length,
      },
      overrideAccess: true,
      context: { skipWatermark: true },
    })

    return NextResponse.json({
      ok: true,
      id: doc.id,
      url: typeof doc.url === 'string' ? doc.url : null,
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

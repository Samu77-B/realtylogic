import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { applyRealtyLogicWatermark } from '@/lib/media/watermark'

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

    const normalised = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer()

    const watermarked = await applyRealtyLogicWatermark(normalised)
    const meta = await sharp(watermarked).metadata()

    const base = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '') || 'image'
    const filename = `${base}-${Date.now()}.jpg`

    const alt =
      String(form.get('alt') || '').trim() ||
      file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') ||
      'Property image'

    // 1) Upload watermarked bytes to Blob ourselves (reliable on Vercel)
    const blob = await put(`media/${filename}`, watermarked, {
      access: 'public',
      token,
      contentType: 'image/jpeg',
      addRandomSuffix: true,
    })

    // 2) Create Media doc — try with file (Payload storage adapter), else URL-only record
    let doc
    try {
      doc = await auth.payload.create({
        collection: 'media',
        data: { alt, watermarked: true },
        file: {
          data: watermarked,
          mimetype: 'image/jpeg',
          name: filename,
          size: watermarked.length,
        },
        overrideAccess: true,
        context: { skipWatermark: true },
      })

      // Prefer the watermarked Blob URL we wrote first
      if (doc.url !== blob.url) {
        try {
          doc = await auth.payload.update({
            collection: 'media',
            id: doc.id,
            data: { url: blob.url, watermarked: true },
            overrideAccess: true,
            context: { skipWatermark: true },
          })
        } catch {
          // keep adapter URL if update fails
        }
      }
    } catch (createErr) {
      console.error('Payload media create with file failed, using URL record:', createErr)
      doc = await auth.payload.create({
        collection: 'media',
        data: {
          alt,
          watermarked: true,
          url: blob.url,
          filename: blob.pathname.split('/').pop() || filename,
          mimeType: 'image/jpeg',
          filesize: watermarked.length,
          width: meta.width ?? undefined,
          height: meta.height ?? undefined,
        },
        overrideAccess: true,
        context: { skipWatermark: true },
      })
    }

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

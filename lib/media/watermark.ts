import { readFileSync, existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

const LOGO_CANDIDATES = [
  'public/Imgs/67ec7d39feaa27e0478ccaf2_RealtyLogic_Logo.png',
  'public/Imgs/RealtyLogic_Logo.png',
]

function getLogoBuffer(): Buffer | null {
  for (const rel of LOGO_CANDIDATES) {
    const full = path.join(process.cwd(), rel)
    if (existsSync(full)) return readFileSync(full)
  }
  return null
}

/**
 * Applies a Realty Logic watermark (logo bottom-right, or text fallback).
 */
export async function applyRealtyLogicWatermark(input: Buffer): Promise<Buffer> {
  const image = sharp(input, { failOn: 'none' })
  const meta = await image.metadata()
  const width = meta.width || 1200
  const height = meta.height || 800

  const logoBuf = getLogoBuffer()

  if (logoBuf) {
    const targetW = Math.max(96, Math.round(width * 0.18))
    const watermark = await sharp(logoBuf)
      .resize({ width: targetW, withoutEnlargement: true })
      .ensureAlpha()
      .png()
      .toBuffer()

    const wmMeta = await sharp(watermark).metadata()
    const wmW = wmMeta.width || targetW
    const wmH = wmMeta.height || Math.round(targetW / 2)
    const margin = Math.max(12, Math.round(width * 0.02))

    // Soft white plate behind logo for contrast on dark/light photos
    const plate = await sharp({
      create: {
        width: wmW + margin,
        height: wmH + margin,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0.45 },
      },
    })
      .png()
      .toBuffer()

    return image
      .composite([
        {
          input: plate,
          left: width - wmW - margin * 2,
          top: height - wmH - margin * 2,
        },
        {
          input: watermark,
          left: width - wmW - Math.round(margin * 1.5),
          top: height - wmH - Math.round(margin * 1.5),
          blend: 'over',
        },
      ])
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer()
  }

  // Text fallback if logo asset is missing
  const fontSize = Math.max(18, Math.round(width * 0.028))
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm { fill: rgba(255,255,255,0.85); font-family: Arial, Helvetica, sans-serif; font-size: ${fontSize}px; font-weight: 600; }
        .shadow { fill: rgba(0,0,0,0.35); }
      </style>
      <text x="${width - 24}" y="${height - 24}" text-anchor="end" class="shadow">Realty Logic</text>
      <text x="${width - 26}" y="${height - 26}" text-anchor="end" class="wm">Realty Logic</text>
    </svg>
  `

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { RL_HOUSE_WATERMARK_PNG_BASE64 } from './rl-house-watermark-data'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

/** Canonical watermark: public/Imgs/rl-house-watermark.png (also bundled + embedded). */
const LOGO_CANDIDATES = [
  path.join(process.cwd(), 'public/Imgs/rl-house-watermark.png'),
  path.join(moduleDir, 'assets/rl-house-watermark.png'),
  path.join(process.cwd(), 'lib/media/assets/rl-house-watermark.png'),
]

function getLogoBufferFromDisk(): Buffer | null {
  for (const full of LOGO_CANDIDATES) {
    try {
      if (existsSync(full)) return readFileSync(full)
    } catch {
      // try next path
    }
  }
  return null
}

async function getLogoBuffer(): Promise<Buffer> {
  const fromDisk = getLogoBufferFromDisk()
  if (fromDisk) return fromDisk

  // Always available: embedded copy of public/Imgs/rl-house-watermark.png
  return Buffer.from(RL_HOUSE_WATERMARK_PNG_BASE64, 'base64')
}

/** Turn near-black background into transparency so the orange house sits cleanly on photos. */
async function logoWithTransparency(logoBuf: Buffer, targetW: number): Promise<Buffer> {
  const { data, info } = await sharp(logoBuf)
    .ensureAlpha()
    .resize({ width: targetW, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = Buffer.from(data)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    // Black / very dark background → transparent
    if (r < 40 && g < 40 && b < 40) {
      pixels[i + 3] = 0
    } else {
      // Keep orange house clearly visible as a watermark
      pixels[i + 3] = Math.round(pixels[i + 3] * 0.9)
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

/**
 * Applies public/Imgs/rl-house-watermark.png to the bottom-right of a property photo.
 * Inset far enough that a typical object-cover crop still keeps the full house visible.
 */
export async function applyRealtyLogicWatermark(input: Buffer): Promise<Buffer> {
  // Bake orientation first so width/height match the pixels we composite onto.
  const normalized = await sharp(input, { failOn: 'none' }).rotate().toBuffer()
  const meta = await sharp(normalized).metadata()
  const width = meta.width || 1200
  const height = meta.height || 800
  const shortSide = Math.min(width, height)

  const logoBuf = await getLogoBuffer()
  // Small mark + large inset so object-cover centre crops don't clip it
  const targetW = Math.max(72, Math.min(160, Math.round(shortSide * 0.08)))
  const watermark = await logoWithTransparency(logoBuf, targetW)
  const trimmed = await sharp(watermark).trim({ threshold: 10 }).png().toBuffer()
  const wmMeta = await sharp(trimmed).metadata()
  const wmW = wmMeta.width || targetW
  const wmH = wmMeta.height || targetW
  const margin = Math.max(48, Math.round(shortSide * 0.1))

  const left = Math.min(Math.max(0, width - wmW - margin), Math.max(0, width - wmW))
  const top = Math.min(Math.max(0, height - wmH - margin), Math.max(0, height - wmH))

  return sharp(normalized)
    .composite([
      {
        input: trimmed,
        left,
        top,
        blend: 'over',
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

const LOGO_CANDIDATES = [
  // Bundled with the API (survives Vercel serverless file tracing)
  path.join(moduleDir, 'assets/rl-house-watermark.png'),
  path.join(process.cwd(), 'lib/media/assets/rl-house-watermark.png'),
  path.join(process.cwd(), 'public/Imgs/rl-house-watermark.png'),
  path.join(process.cwd(), 'public/Imgs/RLHouse.png'),
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

async function getLogoBuffer(): Promise<Buffer | null> {
  const fromDisk = getLogoBufferFromDisk()
  if (fromDisk) return fromDisk

  // Fallback: fetch from the live site's public URL (works when FS path is missing in serverless)
  const host =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')

  if (!host) return null

  try {
    const res = await fetch(`${host.replace(/\/$/, '')}/Imgs/rl-house-watermark.png`)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
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
      // Slight overall transparency so it reads as a watermark
      pixels[i + 3] = Math.round(pixels[i + 3] * 0.82)
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

/**
 * Applies the Realty Logic house watermark (bottom-right).
 */
export async function applyRealtyLogicWatermark(input: Buffer): Promise<Buffer> {
  const image = sharp(input, { failOn: 'none' }).rotate() // honour EXIF orientation
  const meta = await image.metadata()
  const width = meta.width || 1200
  const height = meta.height || 800

  const logoBuf = await getLogoBuffer()

  if (logoBuf) {
    const targetW = Math.max(110, Math.round(width * 0.16))
    const watermark = await logoWithTransparency(logoBuf, targetW)
    const wmMeta = await sharp(watermark).metadata()
    const wmW = wmMeta.width || targetW
    const wmH = wmMeta.height || targetW
    const margin = Math.max(16, Math.round(width * 0.025))

    return image
      .composite([
        {
          input: watermark,
          left: Math.max(0, width - wmW - margin),
          top: Math.max(0, height - wmH - margin),
          blend: 'over',
        },
      ])
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer()
  }

  // Text fallback if logo asset is missing at runtime
  const fontSize = Math.max(18, Math.round(width * 0.028))
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width - 28}" y="${height - 28}" text-anchor="end"
        fill="rgba(240,91,44,0.9)" font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}px" font-weight="700">Realty Logic</text>
    </svg>
  `

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

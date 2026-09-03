import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Payload admin save/create runs as Next.js Server Actions.
  // If Origin (www / vercel.app) does not match Host (x-forwarded-host),
  // the browser shows a generic "Failed to fetch" with no API error.
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        'realtylogic.co.uk',
        'www.realtylogic.co.uk',
        'realtylogic.vercel.app',
      ],
      bodySizeLimit: '8mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), geolocation=(), microphone=(self)',
          },
        ],
      },
    ]
  },
  // Ensure watermark logo is available to API routes on Vercel (serverless FS)
  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/media/assets/**/*', './public/Imgs/rl-house-watermark.png'],
    '/*': ['./lib/media/assets/**/*', './public/Imgs/rl-house-watermark.png'],
  },
}

export default withPayload(nextConfig)

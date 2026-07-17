import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { connection } from 'next/server'
import { headers } from 'next/headers'
import './globals.css'

const openSans = Open_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Realty Logic UK - Property Sales & Rentals',
  description: 'Intelligent Property Solutions',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure we have request context for pathname (fixes Payload admin nesting)
  await connection()
  const headersList = await headers()
  const pathname =
    headersList.get('x-pathname') ??
    headersList.get('x-middleware-request-pathname') ??
    headersList.get('x-middleware-request-x-pathname') ??
    ''

  // Payload admin renders its own <html> and <body> - don't wrap to avoid nesting
  const isPayloadRoute = pathname.startsWith('/admin') || pathname.startsWith('/api')
  if (isPayloadRoute) {
    return <>{children}</>
  }

  return (
    <html lang="en">
      <body className={openSans.className}>
        {children}
      </body>
    </html>
  )
}

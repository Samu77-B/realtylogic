import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { RealtyAIAssistant } from '@/components/RealtyAIAssistant'

export const maxDuration = 60

export const metadata = {
  title: 'Realty AI | Realty Logic',
  robots: { index: false, follow: false },
}

export default async function RealtyAIPage() {
  const auth = await getAdminUser(await headers())
  if (!auth) {
    redirect('/admin/login?redirect=/manager/realty-ai')
  }

  return <RealtyAIAssistant userEmail={auth.user.email} />
}

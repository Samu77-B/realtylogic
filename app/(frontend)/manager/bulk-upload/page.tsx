import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { BulkMediaUploader } from '@/components/BulkMediaUploader'

export const maxDuration = 60

export const metadata = {
  title: 'Bulk photo upload | Realty Logic',
  robots: { index: false, follow: false },
}

export default async function BulkUploadPage() {
  const auth = await getAdminUser(await headers())
  if (!auth) {
    redirect('/admin/login?redirect=/manager/bulk-upload')
  }

  return <BulkMediaUploader />
}

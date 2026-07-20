import { headers as nextHeaders } from 'next/headers'
import type { Payload } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import type { User } from '@/payload-types'

export async function getAdminUser(requestHeaders?: Headers): Promise<{
  payload: Payload
  user: User
} | null> {
  const payload = await getPayloadClient()
  const h = requestHeaders ?? (await nextHeaders())
  const { user } = await payload.auth({ headers: h })
  if (!user) return null
  return { payload, user: user as User }
}

import type { CollectionBeforeChangeHook } from 'payload'
import { geocodeAddress } from '@/lib/geocode'

/**
 * When address is set or changed, fill mapLat/mapLng automatically.
 */
export const geocodeAddressHook: CollectionBeforeChangeHook = async ({ data, originalDoc }) => {
  if (!data) return data

  const nextAddress = typeof data.address === 'string' ? data.address.trim() : ''
  if (!nextAddress) return data

  const prevAddress = typeof originalDoc?.address === 'string' ? originalDoc.address.trim() : ''
  const addressChanged = nextAddress !== prevAddress
  const hasCoords = data.mapLat != null && data.mapLng != null

  if (!addressChanged && hasCoords) return data

  try {
    const result = await geocodeAddress(nextAddress)
    if (result) {
      data.mapLat = result.lat
      data.mapLng = result.lng
    }
  } catch {
    // Keep existing coords if geocoding fails
  }

  return data
}

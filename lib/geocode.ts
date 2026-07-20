export type GeocodeResult = {
  lat: number
  lng: number
  displayName: string
}

/**
 * Geocode a UK/postal address via OpenStreetMap Nominatim (no API key).
 * Respect Nominatim usage policy: identify the app, cache results, low volume.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const query = address.trim()
  if (!query) return null

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '0')

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'RealtyLogicUK/1.0 (property listings; contact@realtylogic.co.uk)',
      Accept: 'application/json',
    },
    next: { revalidate: 86400 },
  })

  if (!res.ok) return null

  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
  const hit = data[0]
  if (!hit) return null

  const lat = Number(hit.lat)
  const lng = Number(hit.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return { lat, lng, displayName: hit.display_name }
}

/** Google Maps embed that centres on an address (shows a pin). */
export function googleMapsEmbedUrl(address: string, zoom = 15): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address.trim())}&z=${zoom}&output=embed`
}

/** Fallback OSM bbox embed from coordinates. */
export function openStreetMapEmbedUrl(lat: number, lng: number, delta = 0.012): string {
  const west = (lng - delta).toFixed(5)
  const south = (lat - delta).toFixed(5)
  const east = (lng + delta).toFixed(5)
  const north = (lat + delta).toFixed(5)
  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${lat}%2C${lng}`
}

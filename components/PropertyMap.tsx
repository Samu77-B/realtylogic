'use client'

type PropertyMapProps = {
  address?: string | null
  location?: string | null
  title?: string | null
  mapLat?: number | null
  mapLng?: number | null
}

export function PropertyMap({ address, location, title, mapLat, mapLng }: PropertyMapProps) {
  const query = (address || location || title || '').trim()
  const hasCoords =
    typeof mapLat === 'number' &&
    Number.isFinite(mapLat) &&
    typeof mapLng === 'number' &&
    Number.isFinite(mapLng)

  const embedSrc = query
    ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
    : hasCoords
      ? `https://www.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent('London, UK')}&z=11&output=embed`

  const externalHref = query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}`
      : 'https://www.google.com/maps/search/?api=1&query=London'

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900">Location</h2>
      {query && <p className="mt-1 text-sm text-gray-600">{query}</p>}
      <div className="mt-4 aspect-video w-full overflow-hidden rounded border border-gray-200 bg-gray-100">
        <iframe
          title="Property location"
          src={embedSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm text-blue-600 hover:underline"
      >
        View on Google Maps
      </a>
    </div>
  )
}

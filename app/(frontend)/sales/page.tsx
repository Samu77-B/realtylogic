import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
import { PropertyCard } from '@/components/PropertyCard'
import { ListingsBanner } from '@/components/ListingsBanner'

export const metadata = {
  title: 'Properties for Sale - Realty Logic UK',
  description: 'Properties for sale',
}

export default async function SalesPage() {
  const payload = await getPayloadClient()

  const { docs: properties } = await payload.find({
    collection: 'properties-sale',
    limit: 100,
    sort: '-createdAt',
  })

  const isSalesAgreed = (status: string | null | undefined) => {
    if (!status) return false
    const s = status.toLowerCase()
    return (
      s.includes('sales agreed') ||
      s.includes('sold') ||
      s.includes('under offer')
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ListingsBanner />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              title={property.title}
              price={property.price || ''}
              bedrooms={property.bedrooms ?? undefined}
              bathrooms={property.bathrooms ?? undefined}
              imageUrl={property.mainImageUrl ?? (typeof property.mainImage === 'object' ? property.mainImage?.url ?? undefined : undefined)}
              href={`/properties-for-sale/${property.slug}`}
              showNewBadge={property.featured ?? false}
              salesAgreed={isSalesAgreed(property.status)}
            />
          ))}
        </div>
        {properties.length === 0 && (
          <p className="text-gray-500">No properties for sale. Add them in the admin.</p>
        )}
      </div>
    </div>
  )
}

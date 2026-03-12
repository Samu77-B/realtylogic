import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
import { PropertyCard } from '@/components/PropertyCard'
import { ListingsBanner } from '@/components/ListingsBanner'

export const metadata = {
  title: 'Rental Properties - Realty Logic UK',
  description: 'Properties to let',
}

export default async function RentalsPage() {
  const payload = await getPayloadClient()

  const { docs: properties } = await payload.find({
    collection: 'properties-rent',
    limit: 100,
    sort: '-createdAt',
  })

  const isRentAgreed = (status: string | null | undefined) => {
    if (!status) return false
    const s = status.toLowerCase()
    return (
      s.includes('let agreed') ||
      s.includes('rent agreed') ||
      s.includes('rented') ||
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
              price={property.monthlyRent || ''}
              bedrooms={property.bedrooms ?? undefined}
              bathrooms={property.bathrooms ?? undefined}
              imageUrl={property.mainImageUrl ?? (typeof property.mainImage === 'object' ? property.mainImage?.url ?? undefined : undefined)}
              href={`/properties-for-rent/${property.slug}`}
              showNewBadge={property.featuredOnFrontPage ?? false}
              isRental
              rentStatusBadge={isRentAgreed(property.status) ? 'Rent Agreed' : 'Available'}
            />
          ))}
        </div>
        {properties.length === 0 && (
          <p className="text-gray-500">No rental properties. Add them in the admin.</p>
        )}
      </div>
    </div>
  )
}

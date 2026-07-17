import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
import { PropertyCard } from '@/components/PropertyCard'
import { Hero } from '@/components/Hero'

export default async function HomePage() {
  const payload = await getPayloadClient()

  const rentalsResult = await payload.find({
    collection: 'properties-rent',
    where: { featuredOnFrontPage: { equals: true } },
    limit: 6,
  })

  const salesResult = await payload.find({
    collection: 'properties-sale',
    where: { featured: { equals: true } },
    limit: 6,
  })

  const rentals = rentalsResult.docs
  const sales = salesResult.docs

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
    <div>
      <Hero />

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading">
            Lettings
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rentals.length > 0 ? (
              rentals.map((property) => (
                <PropertyCard
                  key={property.id}
                  title={property.title}
                  price={property.monthlyRent || ''}
                  bedrooms={property.bedrooms ?? undefined}
                  bathrooms={property.bathrooms ?? undefined}
                  imageUrl={property.mainImageUrl ?? (typeof property.mainImage === 'object' ? property.mainImage?.url ?? undefined : undefined)}
                  href={`/properties-for-rent/${property.slug}`}
                  showNewBadge
                  isRental
                  rentStatusBadge={isRentAgreed(property.status) ? 'Rent Agreed' : 'Available'}
                />
              ))
            ) : (
              <p className="col-span-full text-gray-500">No featured rentals. Add properties in the admin.</p>
            )}
          </div>
          <Link href="/rentals" className="mt-6 inline-block text-blue-600 hover:underline">
            View all rentals →
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading section-heading--sales">
            Sales
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sales.length > 0 ? (
              sales.map((property) => (
                <PropertyCard
                  key={property.id}
                  title={property.title}
                  price={property.price || ''}
                  bedrooms={property.bedrooms ?? undefined}
                  bathrooms={property.bathrooms ?? undefined}
                  imageUrl={property.mainImageUrl ?? (typeof property.mainImage === 'object' ? property.mainImage?.url ?? undefined : undefined)}
                  href={`/properties-for-sale/${property.slug}`}
                  showNewBadge
                  isRental={false}
                  salesAgreed={isSalesAgreed(property.status)}
                />
              ))
            ) : (
              <p className="col-span-full text-gray-500">No featured sales. Add properties in the admin.</p>
            )}
          </div>
          <Link href="/sales" className="mt-6 inline-block text-blue-600 hover:underline">
            View all sales →
          </Link>
        </div>
      </section>
    </div>
  )
}

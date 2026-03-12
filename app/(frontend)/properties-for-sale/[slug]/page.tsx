import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { PropertyImageGallery } from '@/components/PropertyImageGallery'
import { PropertyVideo } from '@/components/PropertyVideo'
import { ArrangeViewingForm } from '@/components/ArrangeViewingForm'
import { ShareSection } from '@/components/ShareSection'

type Props = {
  params: Promise<{ slug: string }>
}

function getMediaUrl(item: unknown): string | null {
  if (typeof item === 'object' && item !== null && 'url' in item && typeof (item as { url?: string }).url === 'string') {
    return (item as { url: string }).url
  }
  return null
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'properties-sale',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const property = docs[0]
  if (!property) return { title: 'Property Not Found' }
  return { title: `${property.title} - Realty Logic` }
}

export default async function PropertySalePage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'properties-sale',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  const property = docs[0]
  if (!property) notFound()

  const mainImageUrl =
    property.mainImageUrl ??
    (typeof property.mainImage === 'object' && property.mainImage?.url) ??
    null

  const imageUrls: string[] = []
  if (mainImageUrl) imageUrls.push(mainImageUrl)
  if (property.images?.length) {
    for (const item of property.images) {
      const img = item.image
      const url = typeof img === 'object' && img !== null ? getMediaUrl(img) : null
      if (url && !imageUrls.includes(url)) imageUrls.push(url)
    }
  }
  if (imageUrls.length === 0) imageUrls.push('https://placehold.co/1200x600?text=Property')

  const agent = typeof property.agent === 'object' ? property.agent : null
  const floorPlan = typeof property.floorPlan === 'object' ? property.floorPlan : null
  const floorPlanUrl = floorPlan && 'url' in floorPlan ? floorPlan.url : null

  const featuresList = property.features
    ? property.features.split(/[,;|\n]/).map((f) => f.trim()).filter(Boolean)
    : ['Spacious property', 'Prime location', 'Modern finish']

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/sales"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← Back to sales
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden bg-white">
              <PropertyImageGallery imageUrls={imageUrls} title={property.title} />

              <div className="p-6 sm:p-8">
                <h1 className="property-heading text-2xl sm:text-3xl">{property.title}</h1>
                {property.location && (
                  <p className="mt-1 text-gray-600">{property.location}</p>
                )}
                {property.status && (
                  <span className="mt-3 inline-block bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                    {property.status}
                  </span>
                )}

                <p className="mt-4 text-2xl font-bold text-teal-600">
                  {property.price}
                </p>

                <div className="mt-4 flex flex-wrap gap-6 text-gray-600">
                  {property.bedrooms != null && (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {property.bedrooms} bed
                    </span>
                  )}
                  {property.bathrooms != null && (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      {property.bathrooms} bath
                    </span>
                  )}
                  {(property.receptions ?? 1) >= 1 && (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      {property.receptions ?? 1} reception
                    </span>
                  )}
                </div>

                <p className="mt-6 text-gray-600">
                  {property.introText ||
                    property.description ||
                    'This property is beautifully presented and offers excellent accommodation in a prime location.'}
                </p>

                {featuresList.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-gray-600">
                    {featuresList.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}

                <ShareSection propertyTitle={property.title} propertyPath={`/properties-for-sale/${property.slug}`} />

                {/* Video */}
                {property.videoUrl && (
                  <PropertyVideo videoUrl={property.videoUrl} title={property.title} />
                )}

                {/* Detailed description */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">Description</h2>
                  <p className="mt-2 text-gray-600">
                    {property.description ||
                      property.introText ||
                      'Boasting a generous size and prime location, this property offers excellent accommodation. The property is finished to a high standard and includes all modern amenities. Perfect for those seeking a quality home in a sought-after area.'}
                  </p>
                </div>

                {property.tenure && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900">Tenure</h2>
                    <p className="mt-2 text-gray-600">{property.tenure}</p>
                  </div>
                )}

                {/* Contact Agent */}
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-semibold text-gray-900">Contact Agent</h2>
                  <div className="mt-4">
                    <p className="font-medium text-gray-900">RealtyLogic</p>
                    {agent && (
                      <>
                        <p className="mt-1 text-gray-600">
                          {agent.name}
                          {agent.email && ` • Sales Negotiator`}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4">
                          {agent.phoneNumber && (
                            <a
                              href={`tel:${agent.phoneNumber.replace(/\s/g, '')}`}
                              className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {agent.phoneNumber}
                            </a>
                          )}
                          {agent.email && (
                            <a
                              href={`mailto:${agent.email}`}
                              className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {agent.email}
                            </a>
                          )}
                        </div>
                      </>
                    )}
                    {!agent && (
                      <div className="mt-3">
                        <a href="tel:02074594097" className="flex items-center gap-2 text-blue-600 hover:underline">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          020 7459 4097
                        </a>
                        <a href="mailto:info@realtylogic.co.uk" className="mt-2 flex items-center gap-2 text-blue-600 hover:underline">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          info@realtylogic.co.uk
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Floor plans */}
                {floorPlanUrl && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900">Floor plans</h2>
                    <div className="mt-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={floorPlanUrl}
                        alt="Floor plan"
                        className="max-h-96 w-auto rounded border border-gray-200 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Map */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                  <div className="mt-4 aspect-video w-full overflow-hidden rounded border border-gray-200">
                    <iframe
                      title="Property location"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.49%2C-0.11%2C51.53&layer=mapnik`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location || property.title || 'London')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Arrange viewing */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ArrangeViewingForm
                propertyTitle={property.title}
                propertySlug={property.slug}
                isRental={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

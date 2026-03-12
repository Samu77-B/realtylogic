import Link from 'next/link'
import Image from 'next/image'

type PropertyCardProps = {
  title: string
  price: string
  bedrooms?: number
  bathrooms?: number
  imageUrl?: string | null
  href: string
  showNewBadge?: boolean
  isRental?: boolean
  /** For rentals: "Rent Agreed" or "Available" */
  rentStatusBadge?: string
  /** For sales: show "Sales Agreed" badge when true */
  salesAgreed?: boolean
}

export function PropertyCard({
  title,
  price,
  bedrooms,
  bathrooms,
  imageUrl,
  href,
  showNewBadge = false,
  isRental = false,
  rentStatusBadge,
  salesAgreed = false,
}: PropertyCardProps) {
  const placeholderUrl = `https://placehold.co/600x400?text=Property`
  const imgUrl = imageUrl || placeholderUrl

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-none bg-white shadow-md transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] shrink-0 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
        {showNewBadge && (
          <div className="absolute left-0 top-0 bg-black px-2 py-1 text-xs font-medium uppercase tracking-wide text-white">
            NEW
          </div>
        )}
        {rentStatusBadge && (
          <div
            className={`absolute right-0 top-0 px-2 py-1 text-xs font-medium uppercase tracking-wide ${
              rentStatusBadge === 'Rent Agreed'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-600 text-white'
            }`}
          >
            {rentStatusBadge}
          </div>
        )}
        {salesAgreed && (
          <div className="absolute right-0 top-0 bg-amber-600 px-2 py-1 text-xs font-medium uppercase tracking-wide text-white">
            Sales Agreed
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h3 className="property-heading line-clamp-2 text-gray-800">{title}</h3>
        <p className="mt-2">
          <span
            className={`inline-block rounded px-3 py-1.5 text-sm font-semibold text-gray-900 ${isRental ? 'bg-[#b2fffc]' : 'bg-[#ffce29]'}`}
          >
            {price}
          </span>
        </p>
        <div className="mt-2 flex gap-4 text-sm text-gray-500">
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <Image src="/Imgs/67b8bf18be15f5cafb1dd60c_Bedrooms.png" alt="" width={20} height={20} className="object-contain opacity-80" />
              {bedrooms}
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <Image src="/Imgs/67b8bf18df1f057067251817_Bathroom.png" alt="" width={20} height={20} className="object-contain opacity-80" />
              {bathrooms}
            </span>
          )}
        </div>
        <div className="mt-auto pt-4">
          <span className="block w-full bg-black py-2.5 text-center text-sm font-medium uppercase tracking-wide text-white transition group-hover:bg-gray-800">
            Details
          </span>
        </div>
      </div>
    </Link>
  )
}

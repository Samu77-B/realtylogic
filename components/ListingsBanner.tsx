import Image from 'next/image'

type ListingsBannerProps = {
  imageSrc?: string
}

export function ListingsBanner({ imageSrc = '/Imgs/67dadcfe9bc25563a5dbbe3a_RentalsLogicMain.jpg' }: ListingsBannerProps) {
  return (
    <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64 lg:h-72">
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
    </div>
  )
}

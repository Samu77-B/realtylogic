import Link from 'next/link'
import Image from 'next/image'

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.5) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.5)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <Link href="/" className="flex items-center">
          <div className="relative h-12 w-32 shrink-0">
            <Image
              src="/Imgs/67ec7d39feaa27e0478ccaf2_RealtyLogic_Logo.png"
              alt="Realty Logic"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
        <a href="tel:02074594097" className="text-lg font-medium text-gray-900">
          020 7459 4097
        </a>
      </div>
    </header>
  )
}

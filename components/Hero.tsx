'use client'

import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative -mt-24 min-h-[90vh] overflow-hidden sm:-mt-28">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/Imgs/67dadcfe9bc25563a5dbbe3a_RentalsLogicMain.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative mx-auto flex min-h-[90vh] max-w-4xl items-center justify-center px-3 pt-24 sm:px-4 sm:pt-32">
        <div
          className="w-full max-w-xl rounded-2xl p-4 backdrop-blur-xl sm:p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.5) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Property Search"
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <button className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:px-4">
                Search
              </button>
            </div>
            <div className="grid grid-cols-4 place-items-center gap-2 sm:gap-4">
              <Link
                href="/rentals"
                className="flex h-[77px] w-[77px] items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 sm:h-[117px] sm:w-[117px] md:h-[155px] md:w-[155px]"
                title="To Let"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Imgs/67c32d67925c12b64795e755_Rent02.png" alt="To Let" className="h-12 w-12 object-contain sm:h-[68px] sm:w-[68px] md:h-[77px] md:w-[77px]" />
              </Link>
              <Link
                href="/sales"
                className="flex h-[77px] w-[77px] items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 sm:h-[117px] sm:w-[117px] md:h-[155px] md:w-[155px]"
                title="For Sale"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Imgs/67c32d673803e214c03ea6b8_Sale02.png" alt="For Sale" className="h-12 w-12 object-contain sm:h-[68px] sm:w-[68px] md:h-[77px] md:w-[77px]" />
              </Link>
              <Link
                href="/contact"
                className="flex h-[77px] w-[77px] items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 sm:h-[117px] sm:w-[117px] md:h-[155px] md:w-[155px]"
                title="Contact"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Imgs/67c32c4028794a3ca7a6cb77_Contact01.png" alt="Contact" className="h-12 w-12 object-contain sm:h-[68px] sm:w-[68px] md:h-[77px] md:w-[77px]" />
              </Link>
              <Link
                href="/contact"
                className="flex h-[77px] w-[77px] items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 sm:h-[117px] sm:w-[117px] md:h-[155px] md:w-[155px]"
                title="New Landlord"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Imgs/67cf88946963fe194a9ae9e4_NewLandlord.png" alt="New Landlord" className="h-12 w-12 object-contain sm:h-[68px] sm:w-[68px] md:h-[77px] md:w-[77px]" />
              </Link>
            </div>
            <div className="border-t border-gray-200 pt-3 sm:pt-4">
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Intelligent Property Solutions</h1>
              <p className="hero-intro">
                Welcome to Realty Logic. We are a company formed for the Property sector, in the UK&apos;s vibrant capital city. With focus to provide exceptional service, expert knowledge, and a personal touch to every transaction. Whether Sales or Lettings, we&apos;re committed to guiding you through the process with clear communication, confidence and care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

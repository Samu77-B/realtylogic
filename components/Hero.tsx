'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'

export function Hero() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const bg = bgRef.current
    if (!section || !bg) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let frame = 0

    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      // Move background slower than scroll (~35% of scroll through section)
      const offset = Math.max(-80, Math.min(80, rect.top * -0.35))
      bg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      router.push('/rentals')
      return
    }
    router.push(`/rentals?q=${encodeURIComponent(q)}`)
  }

  return (
    <section ref={sectionRef} className="relative bg-white">
      {/* Full-bleed hero image band */}
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden sm:h-[48vh] sm:min-h-[360px] md:h-[52vh]">
        <div
          ref={bgRef}
          className="absolute inset-[-12%] will-change-transform bg-cover bg-center"
          style={{
            backgroundImage: 'url(/Imgs/67dadcfe9bc25563a5dbbe3a_RentalsLogicMain.jpg)',
            transform: 'translate3d(0, 0, 0) scale(1.12)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      </div>

      {/* Search card overlapping hero + content */}
      <div className="relative z-10 mx-auto -mt-24 max-w-3xl px-4 pb-6 sm:-mt-32 sm:px-6 md:-mt-36">
        <div
          className="rounded-2xl bg-white px-5 py-6 sm:rounded-3xl sm:px-8 sm:py-8"
          style={{
            boxShadow: '0 18px 50px rgba(0,0,0,0.12), 0 4px 14px rgba(0,0,0,0.06)',
          }}
        >
          <form onSubmit={onSearch} className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Property Search"
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:px-4 sm:py-3 sm:text-base"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black sm:px-6 sm:py-3 sm:text-base"
            >
              Search
            </button>
          </form>

          <div className="mt-6 grid grid-cols-4 place-items-center gap-2 sm:mt-8 sm:gap-6">
            <Link
              href="/rentals"
              className="flex items-center justify-center transition duration-300 ease-out hover:-translate-y-1 hover:scale-105"
              title="To Let"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Imgs/67c32d67925c12b64795e755_Rent02.png"
                alt="To Let"
                className="h-14 w-14 object-contain sm:h-[88px] sm:w-[88px] md:h-[100px] md:w-[100px]"
              />
            </Link>
            <Link
              href="/sales"
              className="flex items-center justify-center transition duration-300 ease-out hover:-translate-y-1 hover:scale-105"
              title="For Sale"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Imgs/67c32d673803e214c03ea6b8_Sale02.png"
                alt="For Sale"
                className="h-14 w-14 object-contain sm:h-[88px] sm:w-[88px] md:h-[100px] md:w-[100px]"
              />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center transition duration-300 ease-out hover:-translate-y-1 hover:scale-105"
              title="Contact"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Imgs/67c32c4028794a3ca7a6cb77_Contact01.png"
                alt="Contact"
                className="h-14 w-14 object-contain sm:h-[88px] sm:w-[88px] md:h-[100px] md:w-[100px]"
              />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center transition duration-300 ease-out hover:-translate-y-1 hover:scale-105"
              title="New Landlord"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Imgs/67cf88946963fe194a9ae9e4_NewLandlord.png"
                alt="New Landlord"
                className="h-14 w-14 object-contain sm:h-[88px] sm:w-[88px] md:h-[100px] md:w-[100px]"
              />
            </Link>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5 sm:mt-8 sm:pt-6">
            <h1 className="!mb-3 !text-[28px] !font-light !leading-tight text-[#333] sm:!text-[36px] sm:!leading-[44px]">
              Intelligent Property Solutions
            </h1>
            <p className="hero-intro !mb-0">
              Welcome to Realty Logic. We are a company formed for the Property sector, in the
              UK&apos;s vibrant capital city. With focus to provide exceptional service, expert
              knowledge, and a personal touch to every transaction. Whether Sales or Lettings,
              we&apos;re committed to guiding you through the process with clear communication,
              confidence and care.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

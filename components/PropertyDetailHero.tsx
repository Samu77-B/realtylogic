import type { ReactNode } from 'react'

type PropertyDetailHeroProps = {
  imageUrl: string
  children: ReactNode
}

const panelShadow = '0 0 40px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.05)'

export function PropertyDetailHero({ imageUrl, children }: PropertyDetailHeroProps) {
  return (
    <section className="relative bg-gray-100">
      {/* Blurred main photo — full width, no foreground duplicate */}
      <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden sm:h-[46vh] sm:min-h-[340px] md:h-[50vh]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="absolute left-1/2 top-1/2 h-[130%] w-[130%] max-w-none -translate-x-1/2 -translate-y-1/2 scale-110 object-cover blur-2xl sm:blur-3xl"
          />
          <div className="absolute inset-0 bg-white/20" />
        </div>
      </div>

      {/* Property details overlap hero (homepage search panel style) */}
      <div className="relative z-10 mx-auto -mt-28 w-full max-w-7xl px-4 pb-10 sm:-mt-36 sm:px-6 md:-mt-44 lg:-mt-52">
        <div
          className="rounded-2xl bg-white px-4 py-6 sm:rounded-3xl sm:px-6 sm:py-8 lg:px-8"
          style={{ boxShadow: panelShadow }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

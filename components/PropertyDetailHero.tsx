import type { CSSProperties, ReactNode } from 'react'

type PropertyDetailHeroProps = {
  imageUrl: string
  children: ReactNode
}

const panelShadow = '0 0 40px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.05)'

/** Blurred band height; panel overlaps 90% so ~10% of blur stays visible above the card. */
const heroBandHeight = 'clamp(200px, 32vh, 420px)'

const overlapStyles = {
  hero: { height: heroBandHeight } satisfies CSSProperties,
  panelWrap: { marginTop: `calc(-0.9 * (${heroBandHeight}))` } satisfies CSSProperties,
}

export function PropertyDetailHero({ imageUrl, children }: PropertyDetailHeroProps) {
  return (
    <section className="relative bg-gray-100">
      {/* Blurred main photo — full width */}
      <div className="relative w-full overflow-hidden" style={overlapStyles.hero}>
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

      {/* Property details — 90% over the hero, 10% blur visible above */}
      <div
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6"
        style={overlapStyles.panelWrap}
      >
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

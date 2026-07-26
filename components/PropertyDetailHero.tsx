type PropertyDetailHeroProps = {
  imageUrl: string
  title: string
}

export function PropertyDetailHero({ imageUrl, title }: PropertyDetailHeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-100 py-5 sm:py-8 md:py-10">
      {/* Blurred ambient background from the main photo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="absolute left-1/2 top-1/2 h-[120%] w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 scale-110 object-cover blur-2xl sm:blur-3xl"
        />
        <div className="absolute inset-0 bg-white/25" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-3 sm:max-w-5xl sm:px-6">
        <div
          className="overflow-hidden rounded-xl bg-white p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:rounded-2xl sm:p-2.5 md:p-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="aspect-[16/10] w-full rounded-lg object-cover sm:aspect-[16/9] md:rounded-xl"
          />
        </div>
      </div>
    </section>
  )
}

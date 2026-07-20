'use client'

import { useCallback, useEffect, useState } from 'react'

type PropertyImageGalleryProps = {
  imageUrls: string[]
  title: string
}

export function PropertyImageGallery({ imageUrls, title }: PropertyImageGalleryProps) {
  const displayImages =
    imageUrls.length > 0 ? imageUrls : ['https://placehold.co/1200x600?text=Property']

  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = displayImages.length

  const go = useCallback(
    (dir: 1 | -1) => {
      setCurrent((p) => (p + dir + count) % count)
    },
    [count],
  )

  useEffect(() => {
    if (count <= 1 || paused) return
    const id = window.setInterval(() => {
      setCurrent((p) => (p + 1) % count)
    }, 4500)
    return () => window.clearInterval(id)
  }, [count, paused])

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0">
        {displayImages.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`${title} — photo ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
              i === current
                ? 'translate-x-0 opacity-100'
                : i === (current - 1 + count) % count
                  ? '-translate-x-8 opacity-0'
                  : 'translate-x-8 opacity-0'
            }`}
            draggable={false}
          />
        ))}
      </div>

      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
        aria-label="Save to favourites"
      >
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
            aria-label="Previous image"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
            aria-label="Next image"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type PropertyImageGalleryProps = {
  imageUrls: string[]
  title: string
}

function WatermarkBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute z-[5] flex items-end justify-end ${className}`}
      aria-hidden
    >
      {/* Soft pad + inset keeps logo clear of the crop edge */}
      <div className="rounded-tl-2xl bg-gradient-to-tl from-black/35 via-black/10 to-transparent p-2 sm:p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Imgs/rl-house-logo.png"
          alt=""
          className="h-14 w-14 object-contain drop-shadow-md sm:h-20 sm:w-20"
        />
      </div>
    </div>
  )
}

export function PropertyImageGallery({ imageUrls, title }: PropertyImageGalleryProps) {
  const displayImages =
    imageUrls.length > 0 ? imageUrls : ['https://placehold.co/1200x600?text=Property']

  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [mounted, setMounted] = useState(false)
  const count = displayImages.length

  const go = useCallback(
    (dir: 1 | -1) => {
      setCurrent((p) => (p + dir + count) % count)
    },
    [count],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (count <= 1 || paused || lightbox) return
    const id = window.setInterval(() => {
      setCurrent((p) => (p + 1) % count)
    }, 4500)
    return () => window.clearInterval(id)
  }, [count, paused, lightbox])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, go])

  return (
    <>
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          type="button"
          className="absolute inset-0 z-[1] cursor-zoom-in"
          onClick={() => setLightbox(true)}
          aria-label={`Enlarge photo ${current + 1} of ${count}`}
        >
          <span className="sr-only">Click to enlarge</span>
        </button>

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

        <WatermarkBadge className="bottom-4 right-4 sm:bottom-6 sm:right-6" />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                go(-1)
              }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
              aria-label="Previous image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                go(1)
              }}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrent(i)
                  }}
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

      {mounted &&
        lightbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — enlarged photo`}
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-[110] rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
              aria-label="Close"
              onClick={() => setLightbox(false)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {count > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 sm:left-6"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(-1)
                  }}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 sm:right-6"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(1)
                  }}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div
              className="relative max-h-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImages[current]}
                alt={`${title} — photo ${current + 1}`}
                className="max-h-[85vh] max-w-full object-contain"
              />
              <WatermarkBadge className="bottom-4 right-4 sm:bottom-6 sm:right-6" />
              <p className="mt-3 text-center text-sm text-white/80">
                {current + 1} / {count} · click outside or press Esc to close
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

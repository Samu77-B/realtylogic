'use client'

import { useState } from 'react'

type PropertyImageGalleryProps = {
  imageUrls: string[]
  title: string
}

export function PropertyImageGallery({ imageUrls, title }: PropertyImageGalleryProps) {
  const displayImages =
    imageUrls.length > 0 ? imageUrls : ['https://placehold.co/1200x600?text=Property']

  const [current, setCurrent] = useState(0)
  const currentImg = displayImages[current] ?? displayImages[0]

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentImg}
        alt={title}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
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
      {displayImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrent((p) => (p - 1 + displayImages.length) % displayImages.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
            aria-label="Previous image"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrent((p) => (p + 1) % displayImages.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
            aria-label="Next image"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
            {displayImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === current ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

type PropertyVideoProps = {
  videoUrl: string
  title: string
}

function getEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; src: string } | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  let parsed: URL
  try {
    parsed = trimmed.includes('://') ? new URL(trimmed) : new URL(`https://${trimmed}`)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const fromQuery = parsed.searchParams.get('v')
    const fromPath = parsed.pathname.split('/').filter(Boolean).pop()
    const id = fromQuery || fromPath
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return { type: 'youtube', src: `https://www.youtube.com/embed/${id}` }
    }
  }

  if (host === 'youtu.be') {
    const id = parsed.pathname.split('/').filter(Boolean)[0]
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return { type: 'youtube', src: `https://www.youtube.com/embed/${id}` }
    }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parsed.pathname.split('/').filter((part) => /^\d+$/.test(part)).pop()
    if (id) {
      return { type: 'vimeo', src: `https://player.vimeo.com/video/${id}` }
    }
  }

  if (parsed.protocol === 'https:' && /\.(mp4|webm|ogg)$/i.test(parsed.pathname)) {
    return { type: 'direct', src: parsed.toString() }
  }

  return null
}

export function PropertyVideo({ videoUrl, title }: PropertyVideoProps) {
  const embed = getEmbedUrl(videoUrl)
  if (!embed) return null

  if (embed.type === 'direct') {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Video</h2>
        <div className="mt-4 aspect-video w-full overflow-hidden rounded border border-gray-200">
          <video
            controls
            className="h-full w-full"
            src={embed.src}
            title={title}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900">Video</h2>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded border border-gray-200">
        <iframe
          title={`Property video - ${title}`}
          src={embed.src}
          width="100%"
          height="100%"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  )
}

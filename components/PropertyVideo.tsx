type PropertyVideoProps = {
  videoUrl: string
  title: string
}

function getEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; src: string } | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  // YouTube: watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}` }
  }

  // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
  }

  // Direct video URL
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed) || trimmed.startsWith('http')) {
    return { type: 'direct', src: trimmed }
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
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  )
}

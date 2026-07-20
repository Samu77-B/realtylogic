'use client'

import { useCallback, useRef, useState } from 'react'

type QueueItem = {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
  previewUrl?: string
  resultUrl?: string | null
}

/** Compress/resize in the browser before upload to stay under serverless limits. */
async function prepareImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  try {
    const bitmap = await createImageBitmap(file)
    const maxEdge = 1800
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85),
    )
    if (!blob) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export function BulkMediaUploader() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) {
      setBanner('Please choose image files (JPG, PNG, WebP, etc.).')
      return
    }
    setBanner(null)
    setQueue((prev) => [
      ...prev,
      ...images.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        status: 'pending' as const,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const uploadAll = async () => {
    if (busy) return
    setBusy(true)
    setBanner(null)

    const pending = queue.filter((q) => q.status === 'pending' || q.status === 'error')
    let failures = 0

    for (const item of pending) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', error: undefined } : q)),
      )

      try {
        const prepared = await prepareImageFile(item.file)
        const form = new FormData()
        form.append('file', prepared)
        const res = await fetch('/api/media/upload-one', {
          method: 'POST',
          body: form,
          credentials: 'same-origin',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Not logged in — open /admin, sign in, then return here.')
          }
          throw new Error(data.error || `Upload failed (${res.status})`)
        }

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'done', resultUrl: data.url ?? null }
              : q,
          ),
        )
      } catch (err) {
        failures += 1
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Upload failed',
                }
              : q,
          ),
        )
      }
    }

    setBusy(false)
    if (failures > 0) {
      setBanner(`${failures} image(s) failed. Fix the errors below and try again.`)
    } else if (pending.length > 0) {
      setBanner('Upload complete. Attach these from Media when editing a property.')
    }
  }

  const clearDone = () => setQueue((prev) => prev.filter((q) => q.status !== 'done'))
  const clearAll = () => {
    if (busy) return
    setQueue([])
    setBanner(null)
  }

  const doneCount = queue.filter((q) => q.status === 'done').length
  const pendingCount = queue.filter((q) => q.status === 'pending' || q.status === 'error').length

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-light text-gray-900" style={{ lineHeight: 1.2 }}>
        Bulk photo upload
      </h1>
      <p className="mt-2 text-gray-600">
        Drag and drop many photos at once. Each image is compressed, watermarked with the Realty
        Logic house logo, and saved to Media.
      </p>
      <p className="mt-1 text-sm text-gray-500">
        You must be logged in at <a className="underline" href="/admin">/admin</a> first.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-8 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? 'border-[var(--color)] bg-orange-50' : 'border-gray-300 bg-[#f8f8f8]'
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        <p className="text-lg text-gray-800">Drop images here</p>
        <p className="mt-1 text-sm text-gray-500">or click to choose multiple files</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {banner && (
        <p className="mt-4 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
          {banner}
        </p>
      )}

      {queue.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy || pendingCount === 0}
              onClick={() => void uploadAll()}
              className="rounded bg-[var(--color)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? 'Uploading…' : `Upload ${pendingCount} image${pendingCount === 1 ? '' : 's'}`}
            </button>
            <button
              type="button"
              disabled={busy || doneCount === 0}
              onClick={clearDone}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
            >
              Clear finished
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={clearAll}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
            >
              Clear all
            </button>
            <span className="text-sm text-gray-500">
              {doneCount}/{queue.length} done
            </span>
          </div>

          <ul className="mt-4 divide-y divide-gray-200 rounded border border-gray-200 bg-white">
            {queue.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.resultUrl || item.previewUrl} alt="" className="h-10 w-10 rounded object-cover" />
                ) : (
                  <span className="h-10 w-10 rounded bg-gray-100" />
                )}
                <span className="min-w-0 flex-1 truncate text-gray-800">{item.file.name}</span>
                <span className="shrink-0 capitalize text-gray-500">{item.status}</span>
                {item.error && <span className="max-w-[45%] truncate text-red-600">{item.error}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

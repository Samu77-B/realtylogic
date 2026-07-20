'use client'

import { useCallback, useRef, useState } from 'react'

type UploadedItem = {
  id: string | number
  url: string | null
  alt?: string | null
  name: string
}

type QueueItem = {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
  result?: UploadedItem
}

export function BulkMediaUploader() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) return
    setQueue((prev) => [
      ...prev,
      ...images.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        status: 'pending' as const,
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

    const pending = queue.filter((q) => q.status === 'pending' || q.status === 'error')
    for (const item of pending) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', error: undefined } : q)),
      )

      try {
        const form = new FormData()
        form.append('file', item.file)
        const res = await fetch('/api/media/upload-one', {
          method: 'POST',
          body: form,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: 'done',
                  result: { id: data.id, url: data.url, alt: data.alt, name: item.file.name },
                }
              : q,
          ),
        )
      } catch (err) {
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
  }

  const clearDone = () => setQueue((prev) => prev.filter((q) => q.status !== 'done'))
  const clearAll = () => {
    if (busy) return
    setQueue([])
  }

  const doneCount = queue.filter((q) => q.status === 'done').length
  const pendingCount = queue.filter((q) => q.status === 'pending' || q.status === 'error').length

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-light text-gray-900" style={{ lineHeight: 1.2 }}>
        Bulk photo upload
      </h1>
      <p className="mt-2 text-gray-600">
        Drag and drop up to 20+ property photos at once. Each image is watermarked with Realty Logic
        automatically, then saved to Media for use on listings.
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
        <p className="mt-1 text-sm text-gray-500">or click to choose multiple files from your computer</p>
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
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    item.status === 'done'
                      ? 'bg-green-500'
                      : item.status === 'error'
                        ? 'bg-red-500'
                        : item.status === 'uploading'
                          ? 'bg-amber-400'
                          : 'bg-gray-300'
                  }`}
                />
                <span className="min-w-0 flex-1 truncate text-gray-800">{item.file.name}</span>
                <span className="shrink-0 text-gray-500">
                  {(item.file.size / 1024 / 1024).toFixed(1)}MB
                </span>
                {item.error && <span className="max-w-[40%] truncate text-red-600">{item.error}</span>}
                {item.result?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.result.url} alt="" className="h-10 w-10 rounded object-cover" />
                )}
              </li>
            ))}
          </ul>

          <p className="mt-3 text-sm text-gray-500">
            After upload, open a property in admin and attach photos from Media (Main Image / Gallery).
          </p>
        </div>
      )}
    </div>
  )
}

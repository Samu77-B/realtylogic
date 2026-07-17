import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

type PayloadCache = {
  client: Payload | null
  promise: Promise<Payload> | null
}

const globalForPayload = globalThis as typeof globalThis & {
  payload?: PayloadCache
}

function getPayloadCache(): PayloadCache {
  if (!globalForPayload.payload) {
    globalForPayload.payload = { client: null, promise: null }
  }

  return globalForPayload.payload
}

export async function getPayloadClient(): Promise<Payload> {
  const cache = getPayloadCache()

  if (cache.client) {
    return cache.client
  }

  if (!cache.promise) {
    cache.promise = getPayload({ config })
  }

  try {
    cache.client = await cache.promise
  } catch (error) {
    cache.promise = null
    throw error
  }

  return cache.client
}

import type { CollectionBeforeChangeHook } from 'payload'
import { generateKeyBetween } from 'payload/shared'

type OrderableProperty = 'properties-rent' | 'properties-sale'

function orderKey(doc: unknown): string | null {
  if (!doc || typeof doc !== 'object') return null
  const value = (doc as { _order?: unknown })._order
  return typeof value === 'string' ? value : null
}

/**
 * Payload's built-in orderable hook appends new docs after the last `_order` key.
 * Run this first on create so the new listing sorts to the top of the live site.
 */
export function putNewPropertyFirstHook(
  collection: OrderableProperty,
): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, operation }) => {
    if (!data || operation !== 'create') return data
    if (orderKey(data) || orderKey(originalDoc)) return data

    const first = await req.payload.find({
      collection,
      depth: 0,
      limit: 1,
      pagination: false,
      req,
      select: { _order: true },
      sort: '_order',
      where: {
        _order: { exists: true },
      },
    })

    ;(data as { _order?: string })._order = generateKeyBetween(null, orderKey(first.docs[0]))
    return data
  }
}

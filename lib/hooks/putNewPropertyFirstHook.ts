import type { CollectionBeforeChangeHook, CollectionSlug } from 'payload'
import { generateKeyBetween } from 'payload/shared'

/**
 * Payload's built-in orderable hook appends new docs after the last `_order` key.
 * Run this first on create so the new listing sorts to the top of the live site.
 */
export function putNewPropertyFirstHook(
  collection: CollectionSlug,
): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, operation }) => {
    if (!data || operation !== 'create') return data
    if (data._order || originalDoc?._order) return data

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

    const firstKey =
      typeof first.docs[0]?._order === 'string' ? first.docs[0]._order : null
    data._order = generateKeyBetween(null, firstKey)
    return data
  }
}

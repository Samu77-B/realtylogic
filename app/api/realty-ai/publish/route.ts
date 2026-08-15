import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/realty-ai/auth'
import { propertyDraftSchema, slugifyTitle } from '@/lib/realty-ai/schema'
import { jsonError } from '@/lib/security'

export const maxDuration = 60

export async function POST(request: Request) {
  const auth = await getAdminUser(request.headers)
  if (!auth) {
    return jsonError(401, 'Please log in at /admin first.')
  }

  const { payload } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'Invalid JSON')
  }

  const parsed = propertyDraftSchema.safeParse((body as { draft?: unknown })?.draft ?? body)
  if (!parsed.success) {
    return jsonError(400, 'Draft is incomplete or invalid.')
  }

  const draft = parsed.data
  const baseSlug = slugifyTitle(draft.title) || `property-${Date.now()}`

  async function uniqueSlug(collection: 'properties-rent' | 'properties-sale', slug: string) {
    let candidate = slug
    let i = 2
    while (true) {
      const existing = await payload.find({
        collection,
        where: { slug: { equals: candidate } },
        limit: 1,
      })
      if (existing.docs.length === 0) return candidate
      if (i > 50) throw new Error('Could not generate a unique slug')
      candidate = `${slug}-${i}`
      i += 1
    }
  }

  try {
    if (draft.listingType === 'sale') {
      if (!draft.price?.trim()) {
        return jsonError(400, 'Sale listings need a price before publishing.')
      }
      const slug = await uniqueSlug('properties-sale', baseSlug)
      const doc = await payload.create({
        collection: 'properties-sale',
        data: {
          title: draft.title,
          slug,
          introText: draft.introText || undefined,
          propertyType: draft.propertyType || undefined,
          bedrooms: draft.bedrooms,
          bathrooms: draft.bathrooms,
          receptions: draft.receptions,
          location: draft.location || undefined,
          price: draft.price,
          description: draft.description || undefined,
          features: draft.features || undefined,
          tenure: draft.tenure || undefined,
          status: draft.status || 'Available',
          videoUrl: draft.videoUrl || undefined,
          featured: draft.featuredOnFrontPage ?? false,
        },
      })
      return NextResponse.json({
        ok: true,
        id: doc.id,
        slug: doc.slug,
        adminPath: `/admin/collections/properties-sale/${doc.id}`,
        publicPath: `/properties-for-sale/${doc.slug}`,
      })
    }

    if (!draft.monthlyRent?.trim()) {
      return jsonError(400, 'Rentals need a monthly rent before publishing.')
    }

    const slug = await uniqueSlug('properties-rent', baseSlug)
    const doc = await payload.create({
      collection: 'properties-rent',
      data: {
        title: draft.title,
        slug,
        introText: draft.introText || undefined,
        propertyType: draft.propertyType || undefined,
        bedrooms: draft.bedrooms,
        bathrooms: draft.bathrooms,
        receptions: draft.receptions,
        location: draft.location || undefined,
        address: draft.address || undefined,
        monthlyRent: draft.monthlyRent,
        deposit: draft.deposit || undefined,
        epcRating: draft.epcRating || undefined,
        status: draft.status || 'Available',
        description: draft.description || undefined,
        features: draft.features || undefined,
        videoUrl: draft.videoUrl || undefined,
        featuredOnFrontPage: draft.featuredOnFrontPage ?? false,
        familiesWelcome: draft.familiesWelcome ?? true,
        studentsAllowed: draft.studentsAllowed ?? false,
        petsAllowed: draft.petsAllowed ?? false,
        smokersAllowed: draft.smokersAllowed ?? false,
        dssAllowed: draft.dssAllowed ?? false,
        couplesAllowed: draft.couplesAllowed ?? true,
        liftAccess: draft.liftAccess ?? false,
      },
    })

    return NextResponse.json({
      ok: true,
      id: doc.id,
      slug: doc.slug,
      adminPath: `/admin/collections/properties-rent/${doc.id}`,
      publicPath: `/properties-for-rent/${doc.slug}`,
    })
  } catch (error) {
    return jsonError(500, 'Failed to publish property.', error)
  }
}

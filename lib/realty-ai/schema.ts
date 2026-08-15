import { z } from 'zod'

export const listingTypeSchema = z.enum(['rent', 'sale'])

export const propertyDraftSchema = z.object({
  listingType: listingTypeSchema.describe('Whether this is a rental or a sale listing'),
  title: z.string().min(1).max(200).describe('Clear property title for the website'),
  introText: z.string().max(1000).optional().describe('Short 1-2 sentence intro'),
  propertyType: z.string().max(80).optional().describe('e.g. Flat, Apartment, Studio, House'),
  bedrooms: z.number().int().nonnegative().max(50).optional(),
  bathrooms: z.number().int().nonnegative().max(50).optional(),
  receptions: z.number().int().nonnegative().max(50).optional(),
  location: z.string().max(200).optional().describe('Area / neighbourhood'),
  address: z.string().max(400).optional().describe('Full address if known'),
  monthlyRent: z.string().max(80).optional().describe('For rentals, e.g. £2,500 pcm'),
  price: z.string().max(80).optional().describe('For sales, e.g. £945,000'),
  deposit: z.string().max(80).optional(),
  epcRating: z.string().max(10).optional(),
  status: z.string().max(80).optional().describe('e.g. Available, Let Agreed, Under Offer'),
  tenure: z.string().max(80).optional().describe('For sales only, e.g. Leasehold'),
  description: z.string().max(20000).optional().describe('Full marketing description'),
  features: z.string().max(5000).optional().describe('Key features, newline or comma separated'),
  videoUrl: z.string().max(500).optional(),
  familiesWelcome: z.boolean().optional(),
  studentsAllowed: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  smokersAllowed: z.boolean().optional(),
  dssAllowed: z.boolean().optional(),
  couplesAllowed: z.boolean().optional(),
  liftAccess: z.boolean().optional(),
  featuredOnFrontPage: z.boolean().optional(),
  assistantMessage: z
    .string()
    .max(500)
    .describe('Short reply to the manager confirming what you captured and what is still missing'),
  readyToPublish: z
    .boolean()
    .describe('True only when required fields are present (title + rent or price)'),
})

export type PropertyDraft = z.infer<typeof propertyDraftSchema>

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

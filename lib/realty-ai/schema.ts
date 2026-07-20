import { z } from 'zod'

export const listingTypeSchema = z.enum(['rent', 'sale'])

export const propertyDraftSchema = z.object({
  listingType: listingTypeSchema.describe('Whether this is a rental or a sale listing'),
  title: z.string().min(1).describe('Clear property title for the website'),
  introText: z.string().optional().describe('Short 1-2 sentence intro'),
  propertyType: z.string().optional().describe('e.g. Flat, Apartment, Studio, House'),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  receptions: z.number().int().nonnegative().optional(),
  location: z.string().optional().describe('Area / neighbourhood'),
  address: z.string().optional().describe('Full address if known'),
  monthlyRent: z.string().optional().describe('For rentals, e.g. £2,500 pcm'),
  price: z.string().optional().describe('For sales, e.g. £945,000'),
  deposit: z.string().optional(),
  epcRating: z.string().optional(),
  status: z.string().optional().describe('e.g. Available, Let Agreed, Under Offer'),
  tenure: z.string().optional().describe('For sales only, e.g. Leasehold'),
  description: z.string().optional().describe('Full marketing description'),
  features: z.string().optional().describe('Key features, newline or comma separated'),
  videoUrl: z.string().optional(),
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

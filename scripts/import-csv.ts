/**
 * Import CSV data into Payload CMS.
 * Uses lorem ipsum for text and placeholder images.
 */

import './load-env-first'
import { parse } from 'csv-parse'
import { createReadStream } from 'fs'
import { join } from 'path'

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const DATA_DIR = join(process.cwd(), '_data')

function placeholderImage(width: number, height: number, text: string): string {
  return `https://placehold.co/${width}x${height}?text=${encodeURIComponent(text)}`
}

async function main() {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../payload.config'),
  ])

  const payload = await getPayload({ config })

  // 1. Import Agents
  const agentsPath = join(DATA_DIR, 'Realty Logic cms - Agents - 67b61b1205f53a31590e2220.csv')
  const agents: { slug: string; name: string }[] = []

  await new Promise<void>((resolve, reject) => {
    const records: Record<string, string>[] = []
    createReadStream(agentsPath)
      .pipe(parse({ columns: true, relax_column_count: true }))
      .on('data', (row: Record<string, string>) => records.push(row))
      .on('end', async () => {
        for (const row of records) {
          const slug = row['Slug']?.trim()
          const name = row['Name']?.trim()
          if (!slug || !name) continue

          try {
            const existing = await payload.find({
              collection: 'agents',
              where: { slug: { equals: slug } },
              limit: 1,
            })
            if (existing.docs.length > 0) {
              agents.push({ slug, name })
              console.log(`Agent ${name} already exists`)
              continue
            }
            await payload.create({
              collection: 'agents',
              data: {
                name,
                slug,
                profilePhotoUrl: placeholderImage(200, 200, name),
                email: row['Email'] || `agent-${slug}@example.com`,
                phoneNumber: row['Phone Number'] || '',
              },
            })
            agents.push({ slug, name })
            console.log(`Agent: ${name}`)
          } catch (e) {
            if (String(e).includes('duplicate') || String(e).includes('unique')) {
              console.log(`Agent ${name} already exists`)
            } else throw e
          }
        }
        resolve()
      })
      .on('error', reject)
  })

  const agentSlugToId = new Map<string, number | string>()
  const { docs: agentDocs } = await payload.find({ collection: 'agents', limit: 100 })
  for (const a of agentDocs) {
    agentSlugToId.set(a.slug, a.id as number)
  }

  // 2. Import Properties for Sale (exclude Draft=true)
  const salesPath = join(DATA_DIR, 'Realty Logic cms - Properties for sales - 67b4da058995edee624a0d4a.csv')
  await new Promise<void>((resolve, reject) => {
    const records: Record<string, string>[] = []
    createReadStream(salesPath)
      .pipe(parse({ columns: true, relax_column_count: true }))
      .on('data', (row: Record<string, string>) => records.push(row))
      .on('end', async () => {
        for (const row of records) {
          if (row['Draft'] === 'true') continue
          const slug = row['Slug']?.trim()
          const name = row['Name']?.trim()
          if (!slug || !name) continue

          const agentSlug = row['Agent']?.trim()
          const agentId = agentSlug ? agentSlugToId.get(agentSlug) : undefined

          try {
            const existing = await payload.find({
              collection: 'properties-sale',
              where: { slug: { equals: slug } },
              limit: 1,
            })
            if (existing.docs.length > 0) {
              console.log(`Sale ${name} already exists`)
              continue
            }
            await payload.create({
              collection: 'properties-sale',
              data: {
                title: name,
                slug,
                introText: LOREM,
                propertyType: row['Property Type'] || '',
                bedrooms: parseInt(row['Bedrooms']?.trim() || '0', 10) || undefined,
                bathrooms: parseInt(row['Bathrooms']?.trim() || '0', 10) || undefined,
                location: row['Location'] || '',
                price: row['Property Price'] || '',
                description: LOREM,
                mainImageUrl: placeholderImage(800, 600, name),
                features: row['Features'] || '',
                tenure: row['Tenure'] || '',
                featured: row['Featured Property'] === 'true',
              },
            })
            console.log(`Sale: ${name}`)
          } catch (e) {
            if (String(e).includes('duplicate') || String(e).includes('unique')) {
              console.log(`Sale ${name} already exists`)
            } else throw e
          }
        }
        resolve()
      })
      .on('error', reject)
  })

  // 3. Import Properties for Rent (exclude Draft=true)
  const rentsPath = join(DATA_DIR, 'Realty Logic cms - Properties for rents - 67b5019005baccbd347c5005.csv')
  await new Promise<void>((resolve, reject) => {
    const records: Record<string, string>[] = []
    createReadStream(rentsPath)
      .pipe(parse({ columns: true, relax_column_count: true }))
      .on('data', (row: Record<string, string>) => records.push(row))
      .on('end', async () => {
        for (const row of records) {
          if (row['Draft'] === 'true') continue
          const slug = row['Slug']?.trim()
          const name = row['Name']?.trim()
          if (!slug || !name) continue

          const agentSlug = row['Agents Name']?.trim()
          const agentId = agentSlug ? agentSlugToId.get(agentSlug) : undefined

          try {
            const existing = await payload.find({
              collection: 'properties-rent',
              where: { slug: { equals: slug } },
              limit: 1,
            })
            if (existing.docs.length > 0) {
              console.log(`Rent ${name} already exists`)
              continue
            }
            await payload.create({
              collection: 'properties-rent',
              data: {
                title: name,
                slug,
                introText: LOREM,
                propertyType: row['Property Type'] || '',
                bedrooms: parseInt(row['Bedrooms']?.trim() || '0', 10) || undefined,
                bathrooms: parseInt(row['Bathrooms']?.trim() || '0', 10) || undefined,
                location: row['Location'] || row['Property Address'] || '',
                monthlyRent: row['Monthly rent'] || row['Monthly Rent'] || '',
                description: LOREM,
                mainImageUrl: placeholderImage(800, 600, name),
                features: row['Features'] || '',
                featuredOnFrontPage: row['Featured on front page'] === 'true',
              },
            })
            console.log(`Rent: ${name}`)
          } catch (e) {
            if (String(e).includes('duplicate') || String(e).includes('unique')) {
              console.log(`Rent ${name} already exists`)
            } else throw e
          }
        }
        resolve()
      })
      .on('error', reject)
  })

  console.log('Import complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

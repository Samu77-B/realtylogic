/**
 * Import CSV data into Payload CMS.
 * Rentals use real Webflow export text; images left empty for admin upload.
 */

import './load-env-first'
import { parse } from 'csv-parse'
import { createReadStream, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), '_data')

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\u200d/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseBool(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

function parseOptionalInt(value: string | undefined): number | undefined {
  const n = parseInt(value?.trim() || '', 10)
  return Number.isFinite(n) ? n : undefined
}

async function readCsv(path: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const records: Record<string, string>[] = []
    createReadStream(path)
      .pipe(parse({ columns: true, relax_column_count: true, relax_quotes: true }))
      .on('data', (row: Record<string, string>) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject)
  })
}

async function main() {
  console.log('Loading Payload...')
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../payload.config'),
  ])
  console.log('Connecting to database...')

  const payload = await getPayload({ config })
  console.log('Connected.')

  // 1. Import Agents
  const agentsPath = join(DATA_DIR, 'Realty Logic cms - Agents - 67b61b1205f53a31590e2220.csv')
  if (existsSync(agentsPath)) {
    const records = await readCsv(agentsPath)
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
          console.log(`Agent ${name} already exists`)
          continue
        }
        await payload.create({
          collection: 'agents',
          data: {
            name,
            slug,
            email: row['Email'] || `agent-${slug}@example.com`,
            phoneNumber: row['Phone Number'] || '',
          },
        })
        console.log(`Agent: ${name}`)
      } catch (e) {
        if (String(e).includes('duplicate') || String(e).includes('unique')) {
          console.log(`Agent ${name} already exists`)
        } else throw e
      }
    }
  } else {
    console.log('Agents CSV not found — skipping agents')
  }

  const agentSlugToId = new Map<string, number | string>()
  const { docs: agentDocs } = await payload.find({ collection: 'agents', limit: 100 })
  for (const a of agentDocs) {
    agentSlugToId.set(a.slug, a.id as number)
  }

  // 2. Import Properties for Sale (optional — skip if CSV missing)
  const salesPath = join(DATA_DIR, 'Realty Logic cms - Properties for sales - 67b4da058995edee624a0d4a.csv')
  if (existsSync(salesPath)) {
    const records = await readCsv(salesPath)
    for (const row of records) {
      if (row['Draft'] === 'true') continue
      const slug = row['Slug']?.trim()
      const name = row['Name']?.trim()
      if (!slug || !name) continue

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
            introText: row['Intro Text']?.trim() || '',
            propertyType: row['Property Type'] || '',
            bedrooms: parseOptionalInt(row['Bedrooms']),
            bathrooms: parseOptionalInt(row['Bathrooms']),
            location: row['Location'] || '',
            price: row['Property Price'] || '',
            description: stripHtml(row['Description'] || ''),
            features: row['Features'] || '',
            tenure: row['Tenure'] || '',
            featured: parseBool(row['Featured Property']),
          },
        })
        console.log(`Sale: ${name}`)
      } catch (e) {
        if (String(e).includes('duplicate') || String(e).includes('unique')) {
          console.log(`Sale ${name} already exists`)
        } else throw e
      }
    }
  } else {
    console.log('Sales CSV not found — skipping sales')
  }

  // 3. Import Properties for Rent (real text; no images — upload later in admin)
  const rentsPath = join(DATA_DIR, 'Realty Logic cms - Properties for rents - 67b5019005baccbd347c5005.csv')
  if (!existsSync(rentsPath)) {
    throw new Error(`Rentals CSV not found: ${rentsPath}`)
  }

  let created = 0
  let skipped = 0
  const records = await readCsv(rentsPath)
  console.log(`Rentals CSV rows: ${records.length}`)

  for (const row of records) {
    if (row['Draft'] === 'true') {
      skipped++
      continue
    }
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
        skipped++
        continue
      }

      await payload.create({
        collection: 'properties-rent',
        data: {
          title: name,
          slug,
          introText: row['Intro Text']?.trim() || '',
          propertyType: row['Property Type']?.trim() || '',
          bedrooms: parseOptionalInt(row['Bedrooms']),
          bathrooms: parseOptionalInt(row['Bathrooms']),
          location: row['Location']?.trim() || row['Property Address']?.trim() || '',
          address: row['Property Address']?.trim() || '',
          monthlyRent: row['Monthly rent']?.trim() || row['Monthly Rent']?.trim() || '',
          deposit: row['Deposit']?.trim() || '',
          description: stripHtml(row['Description'] || ''),
          features: row['Features']?.trim() || '',
          epcRating: row['EPC Rating']?.trim() || '',
          videoUrl: row['YouTube-Link']?.trim() || row['Matterport URL']?.trim() || '',
          status: parseBool(row['Let Agreed']) ? 'Let Agreed' : 'Available',
          featuredOnFrontPage: parseBool(row['Featured on front page']),
          familiesWelcome: parseBool(row['Families Allowed']),
          studentsAllowed: parseBool(row['Student Friendly']),
          petsAllowed: parseBool(row['Pets Allowed']),
          smokersAllowed: parseBool(row['Smokers Allowed']),
          ...(agentId ? { agent: agentId } : {}),
        },
      })
      created++
      console.log(`Rent: ${name}`)
    } catch (e) {
      if (String(e).includes('duplicate') || String(e).includes('unique')) {
        console.log(`Rent ${name} already exists`)
        skipped++
      } else throw e
    }
  }

  console.log(`Import complete. Rentals created: ${created}, skipped: ${skipped}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})

# Realty Logic UK

Property sales and rentals website built with Next.js and Payload CMS.

## Setup

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Create a **Neon** Postgres database (free tier):

   - Sign in at [neon.tech](https://neon.tech)
   - Create a project named `realtylogic` (region: **EU**, e.g. `eu-west-2`)
   - Open **Dashboard → Connection details**
   - Copy the **Pooled connection** string (recommended for Vercel serverless)

3. Copy `.env.example` to `.env` and set:

   - `DATABASE_URI` – Neon pooled Postgres connection string
   - `PAYLOAD_SECRET` – A secure random string (32+ characters)
   - `BLOB_READ_WRITE_TOKEN` – Optional locally; required on Vercel for photo uploads (see below)

4. Initialize the database (run once after setting `.env`):

```bash
npm run init:db
npm run import:csv
```

Alternatively, run `npm run dev` and visit `http://localhost:3000/admin` to create the schema and your first admin user manually, then run `npm run import:csv`.

5. Default admin (when using `npm run init:db`):

   - Email: `admin@realtylogic.co.uk` (override with `ADMIN_EMAIL` in `.env`)
   - Password: `ChangeMe123!` (override with `ADMIN_PASSWORD` in `.env`)

6. Import CSV data (run after creating admin user):

```bash
npm run import:csv
```

This imports agents, properties for sale, and properties for rent from the `_data` folder. Text is replaced with lorem ipsum and images use placeholders.

## Vercel deployment

Set these environment variables in the Vercel project (**Settings → Environment Variables**). See [`vercel.env.example`](vercel.env.example) for a template.

| Variable | Value |
|----------|--------|
| `DATABASE_URI` | Same Neon pooled connection string as local `.env` |
| `PAYLOAD_SECRET` | Same secret as local `.env` |
| `BLOB_READ_WRITE_TOKEN` | From Vercel **Storage → Blob** after adding Blob to the project |

**Photo uploads on Vercel:** Add **Blob storage** to the Vercel project (**Storage → Create → Blob**). Vercel sets `BLOB_READ_WRITE_TOKEN` automatically. Without this token, image uploads fail on production (serverless has no persistent disk). Payload uses `@payloadcms/storage-vercel-blob` with client-side uploads for files up to 30MB.

After adding Blob, redeploy the project, then upload again in **Admin → Media** (or on a property’s Main Image field).

After changing env vars, redeploy the project. The homepage and `/admin` should load without database errors once `DATABASE_URI` points at an active Neon database.

## Bulk photo upload

Managers (logged into `/admin`) can open `/manager/bulk-upload` to drag-and-drop many images at once. Each photo is watermarked and saved to **Media**.

## Realty AI (manager assistant)

Managers can open `/manager/realty-ai` after logging in at `/admin`.

- Speak or type property details
- Review the live draft panel
- Say **Publish** (or press the button) to create the listing
- Add photos afterwards in Payload admin

Requires Vercel AI Gateway (OIDC on Vercel, or `AI_GATEWAY_API_KEY` locally). See `.env.example`.

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run init:db` – Create Payload tables and first admin user
- `npm run import:csv` – Import CSV data into Payload

## Structure

- `/` – Home page with featured lettings and sales
- `/rentals` – All rental properties
- `/sales` – All properties for sale
- `/properties-for-rent/[slug]` – Rental property detail
- `/properties-for-sale/[slug]` – Sale property detail
- `/rentals-logic` – Rentals Logic app (coming soon)
- `/contact` – Contact page
- `/admin` – Payload CMS admin panel

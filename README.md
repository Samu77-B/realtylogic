# Realty Logic UK

Property sales and rentals website built with Next.js and Payload CMS.

## Setup

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Copy `.env.example` to `.env` and set:

- `DATABASE_URI` – Supabase Postgres connection string (use the **Transaction pooler** URI from Supabase → Project Settings → Database)
- `PAYLOAD_SECRET` – A secure random string for production

3. Initialize the database tables (run once after setting `.env`):

```bash
npm run dev
```

Visit `http://localhost:3000/admin` once so Payload can create the database schema in Supabase.

4. Create your first admin user at [http://localhost:3000/admin](http://localhost:3000/admin)

5. Import CSV data (run after creating admin user):

```bash
npm run import:csv
```

This imports agents, properties for sale, and properties for rent from the `_data` folder. Text is replaced with lorem ipsum and images use placeholders.

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
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

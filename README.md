# Realty Logic UK

Property sales and rentals website built with Next.js and Payload CMS.

## Setup

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Copy `.env.example` to `.env` and set:

- `DATABASE_URI` – SQLite file path (default: `file:./payload.db`)
- `PAYLOAD_SECRET` – A secure random string for production

3. Start the development server:

```bash
npm run dev
```

4. Create your first admin user at [http://localhost:3000/admin](http://localhost:3000/admin) (run dev server first so the database is created)

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

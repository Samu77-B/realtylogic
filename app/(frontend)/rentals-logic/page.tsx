export const metadata = {
  title: 'Rentals Logic - Property Inventory App',
  description: 'Simple property inventory software for landlords and tenants',
}

export default function RentalsLogicPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-16 text-white">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
            Coming Soon
          </span>
          <h1 className="mt-4 text-4xl font-bold">Rentals Logic</h1>
          <p className="mt-4 max-w-2xl text-xl text-slate-300">
            Simple property inventory software for landlords and tenants. Paperless check-in and check-out reports, 
            compliance checklists, and beautiful galleries.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium">
              Monthly subscription
            </span>
            <span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium">
              Paperless workflows
            </span>
            <span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium">
              Check-in / Check-out
            </span>
            <span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium">
              Tenant feedback
            </span>
          </div>
          <div className="mt-12">
            <button
              disabled
              className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 opacity-75"
            >
              Launching Soon
            </button>
          </div>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900">Inventories</h3>
            <p className="mt-2 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Create paperless inventories for every property.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900">Check-in & Check-out</h3>
            <p className="mt-2 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Document condition with photos and notes.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900">Compliance</h3>
            <p className="mt-2 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Built-in checklists for regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

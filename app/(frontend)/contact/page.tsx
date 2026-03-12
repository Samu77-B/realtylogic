export const metadata = {
  title: 'Contact - Realty Logic UK',
  description: 'Contact Realty Logic',
}

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Contact</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xl font-semibold">Address</h2>
            <p className="text-gray-600">167-169 Great Portland St, London W1W 5PF</p>
          </div>
          <div>
            <h2 className="mb-2 text-xl font-semibold">Email</h2>
            <a href="mailto:contact@realtylogic.co.uk" className="block text-blue-600 hover:underline">
              contact@realtylogic.co.uk
            </a>
            <a href="mailto:info@realtylogic.co.uk" className="block text-blue-600 hover:underline">
              info@realtylogic.co.uk
            </a>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">Phone</h2>
          <a href="tel:02074594097" className="text-blue-600 hover:underline">
            020 7459 4097
          </a>
        </div>
        <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-8">
          <h3 className="mb-4 text-lg font-semibold">Send us a message</h3>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Contact form placeholder.
          </p>
        </div>
      </div>
    </div>
  )
}

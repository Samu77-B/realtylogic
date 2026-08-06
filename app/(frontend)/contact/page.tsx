import { ContactForm } from '@/components/ContactForm'
import { ListingsBanner } from '@/components/ListingsBanner'

export const metadata = {
  title: 'Contact - Realty Logic UK',
  description: 'Contact Realty Logic',
}

export default function ContactPage() {
  return (
    <div className="bg-white">
      <ListingsBanner imageSrc="/Imgs/6964f503ee04debc37971b64_kitchen..jpeg" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-light text-gray-400 sm:text-3xl">Address</h2>
              <p className="mt-2 text-sm text-gray-900 sm:text-base">
                167-169 Great Portland St., London W1W 5PF
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-light text-gray-400 sm:text-3xl">Email</h2>
              <a
                href="mailto:contact@realtylogic.co.uk"
                className="mt-2 block text-sm text-gray-900 hover:underline sm:text-base"
              >
                contact@realtylogic.co.uk
              </a>
              <a
                href="mailto:info@realtylogic.co.uk"
                className="block text-sm text-gray-900 hover:underline sm:text-base"
              >
                info@realtylogic.co.uk
              </a>
            </div>
            <div>
              <h2 className="text-2xl font-light text-gray-400 sm:text-3xl">Phone</h2>
              <a
                href="tel:02074594097"
                className="mt-2 block text-sm text-gray-900 hover:underline sm:text-base"
              >
                020 7459 4097
              </a>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  )
}

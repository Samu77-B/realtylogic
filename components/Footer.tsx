import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <a href="tel:02074594097" className="block text-white hover:text-gray-200">
              020 7459 4097
            </a>
            <a href="mailto:contact@realtylogic.co.uk" className="block hover:text-gray-200">
              contact@realtylogic.co.uk
            </a>
            <a href="mailto:info@realtylogic.co.uk" className="block hover:text-gray-200">
              info@realtylogic.co.uk
            </a>
            <p className="text-sm">
              Realty Logic Ltd. 163-168 Great Portland St, London W1W 5PQ
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-600 transition hover:border-gray-500 hover:text-white"
              >
                <Image src="/Imgs/67ccb234b67c99b46de07b2a_InstaIcon.png" alt="Instagram" width={20} height={20} className="object-contain" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-600 transition hover:border-gray-500 hover:text-white"
              >
                <Image src="/Imgs/67dadfe3a648dab3806cb00c_facebookRL.png" alt="Facebook" width={20} height={20} className="object-contain" />
              </a>
              <a
                href="#"
                aria-label="X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-600 transition hover:border-gray-500 hover:text-white"
              >
                <Image src="/Imgs/67dae5c3975676222a723743_Xicon.png" alt="X (Twitter)" width={20} height={20} className="object-contain" />
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/terms-conditions" className="hover:text-white">
              Terms & conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/rentals" className="hover:text-white">
              Properties to Let
            </Link>
            <Link href="/sales" className="hover:text-white">
              Properties for Sale
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-gray-500">
          Realty Logic. © Copyright {new Date().getFullYear()}
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Website designed, built and maintained by{' '}
          <a href="https://paradigmstudio.net" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
            paradigmstudio.net
          </a>
        </p>
        <p className="mt-1 text-center">
          <div className="flex items-center gap-3">
            <Link href="/manager/realty-ai" className="text-xs text-gray-600 opacity-50 hover:opacity-70 hover:text-gray-500 transition-opacity">
              Realty AI
            </Link>
            <Link href="/admin" className="text-xs text-gray-600 opacity-50 hover:opacity-70 hover:text-gray-500 transition-opacity">
              Admin
            </Link>
          </div>
        </p>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import Image from 'next/image'

export function Header() {
  return (
    <header className="relative z-50 border-b border-gray-100 bg-white">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/Imgs/rl-house-logo.png"
            alt=""
            width={48}
            height={48}
            className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
            priority
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
              Realty Logic
            </span>
            <span className="truncate text-[11px] font-normal text-gray-500 sm:text-xs">
              Intelligent Property Solutions
            </span>
          </span>
        </Link>
        <a
          href="tel:02074594097"
          className="shrink-0 whitespace-nowrap pl-3 text-sm font-semibold text-gray-900 sm:pl-4 sm:text-lg"
        >
          020 7459 4097
        </a>
      </div>
    </header>
  )
}

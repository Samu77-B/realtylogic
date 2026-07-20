import Image from 'next/image'

type WeChatContactCardProps = {
  className?: string
}

export function WeChatContactCard({ className = '' }: WeChatContactCardProps) {
  return (
    <div className={`rounded-lg bg-gray-100 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">WeChat</h3>
      <p className="mt-1 text-sm text-gray-600">Scan to message us on WeChat</p>
      <div className="mt-4 flex justify-center">
        <Image
          src="/Imgs/naz-wechat-qr.png"
          alt="WeChat QR code for Realty Logic"
          width={180}
          height={180}
          className="h-[180px] w-[180px] rounded bg-white object-contain p-2"
          priority={false}
        />
      </div>
    </div>
  )
}

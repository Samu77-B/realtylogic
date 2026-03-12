import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { connection } from 'next/server'
import { headers } from 'next/headers'
import './globals.css'

const openSans = Open_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Realty Logic UK - Property Sales & Rentals',
  description: 'Intelligent Property Solutions',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure we have request context for pathname (fixes Payload admin nesting)
  await connection()
  const headersList = await headers()
  const pathname =
    headersList.get('x-pathname') ??
    headersList.get('x-middleware-request-pathname') ??
    headersList.get('x-middleware-request-x-pathname') ??
    ''

  // Payload admin renders its own <html> and <body> - don't wrap to avoid nesting
  const isPayloadRoute = pathname.startsWith('/admin') || pathname.startsWith('/api')
  if (isPayloadRoute) {
    return <>{children}</>
  }

  return (
    <html lang="en">
      <body className={openSans.className}>
        {/* #region agent log */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var endpoint='http://127.0.0.1:7243/ingest/5570b865-435a-430c-962c-13142ca2569b';
  function send(d){try{fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).catch(function(){});}catch(e){}}
  function capture(err){
    if(!err)return;
    var payload={location:'chunk-error-handler',message:'ChunkLoadError',data:{name:err.name,message:err.message,request:err.request||null,type:err.type||null,href:typeof location!=='undefined'?location.href:''},timestamp:Date.now(),hypothesisId:'H1,H2,H4'};
    send(payload);
    try{localStorage.setItem('__chunkLoadError',JSON.stringify(payload));}catch(e){}
  }
  window.addEventListener('error',function(e){if(e.error&&(e.error.name==='ChunkLoadError'||(e.message&&e.message.indexOf('Loading chunk')>=0)))capture(e.error);});
  window.addEventListener('unhandledrejection',function(e){if(e.reason&&(e.reason.name==='ChunkLoadError'||(e.reason.message&&e.reason.message.indexOf('Loading chunk')>=0))){capture(e.reason);e.preventDefault();}});
})();
`,
          }}
        />
        {/* #endregion agent log */}
        {children}
      </body>
    </html>
  )
}

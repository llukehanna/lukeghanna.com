import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="label">404</p>
      <h1 className="text-[32px] font-bold tracking-[-0.03em]">Nothing here.</h1>
      <Link href="/" className="text-mute underline decoration-line underline-offset-4 hover:text-ink">Back to lukeghanna.com</Link>
    </main>
  )
}

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display text-signal-amber mb-4">404</div>
        <h1 className="text-2xl text-paper font-display mb-2">Page not found</h1>
        <p className="text-paper/50 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-lg bg-signal-amber text-ink font-medium hover:brightness-110 transition-all"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}

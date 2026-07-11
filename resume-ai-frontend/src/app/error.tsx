"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-display text-coral mb-4">:(</div>
        <h1 className="text-2xl text-paper font-display mb-2">Something went wrong</h1>
        <p className="text-paper/50 mb-2">
          {error.message || "An unexpected error occurred."}
        </p>
        <p className="text-paper/40 text-sm mb-8">
          Try refreshing the page. If the problem persists, contact support.
        </p>
        <button
          onClick={reset}
          className="inline-flex px-6 py-3 rounded-lg bg-signal-amber text-ink font-medium hover:brightness-110 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

import Link from "next/link"

export default function NavBar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 mx-4 mt-2 max-w-5xl lg:mx-auto transition-all duration-300"
      style={{ borderRadius: "9999px", backdropFilter: "blur(12px)", background: "rgba(14,18,30,0.7)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-between h-16 px-6 max-w-6xl mx-auto">
        <Link href="/" className="font-display text-xl text-paper tracking-tight">ResumeRank AI</Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-paper/70">
          <a href="#product" className="hover:text-paper transition-colors">Product</a>
          <a href="#how-it-works" className="hover:text-paper transition-colors">How it works</a>
          <a href="#features" className="hover:text-paper transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-paper/70 hover:text-paper transition-colors">Login</Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-signal-amber text-ink font-medium hover:brightness-110 transition-all">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}

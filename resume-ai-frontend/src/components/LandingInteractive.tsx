"use client"

import { useEffect, useRef, useCallback, useState } from "react"

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass-pill mx-4 mt-2 max-w-5xl lg:mx-auto" : ""}`}>
      <div className="flex items-center justify-between h-16 px-6 max-w-6xl mx-auto">
        <a href="/" className="font-display text-xl text-paper tracking-tight">ResumeRank AI</a>
        <div className="hidden md:flex items-center gap-8 text-sm text-paper/70">
          <a href="#product" className="hover:text-paper transition-colors">Product</a>
          <a href="#how-it-works" className="hover:text-paper transition-colors">How it works</a>
          <a href="#features" className="hover:text-paper transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-paper/70 hover:text-paper transition-colors">Login</a>
          <a href="/register" className="text-sm px-4 py-2 rounded-lg bg-signal-amber text-ink font-medium hover:brightness-110 transition-all">Get Started</a>
        </div>
      </div>
    </nav>
  )
}

export function JitterHeadline({ text, as: Tag = "h1", className = "" }: { text: string; as?: "h1" | "h2" | "h3"; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const handleHover = useCallback(() => {
    if (!ref.current) return
    ref.current.querySelectorAll(".hw").forEach((word) => {
      const w = word as HTMLElement
      w.style.transition = "all 150ms cubic-bezier(0.2,0.8,0.2,1)"
      w.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px) rotate(${Math.random() * 2 - 1}deg)`
      setTimeout(() => { w.style.transform = "" }, 200)
    })
  }, [])
  return (
    <Tag ref={ref} onMouseEnter={handleHover} className={`font-display leading-tight ${className}`} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="hw inline-block">{i > 0 ? "\u00A0" : ""}{word}</span>
      ))}
    </Tag>
  )
}

export function CursorReveal({ children, frostContent, radius = 120 }: { children: React.ReactNode; frostContent?: React.ReactNode; radius?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: -999, y: -999 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => { setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0) }, [])

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }
  const handleLeave = () => { if (!isTouch) setPos({ x: -999, y: -999 }) }

  return (
    <div ref={ref} onMouseMove={handleMouse} onMouseLeave={handleLeave} onClick={() => isTouch && setPos({ x: 9999, y: 9999 })} className="relative overflow-hidden rounded-xl" style={{ touchAction: "manipulation" }}>
      {frostContent && (
        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          WebkitMaskImage: isTouch ? undefined : `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, transparent 0%, black 100%)`,
          maskImage: isTouch ? undefined : `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, transparent 0%, black 100%)`,
          WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
          transition: isTouch ? "opacity 0.4s ease" : undefined,
          opacity: isTouch && pos.x > 9000 ? 1 : undefined,
        }}>{frostContent}</div>
      )}
      {children}
    </div>
  )
}

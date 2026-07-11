"use client"

import { useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"

const JitterHeadline = dynamic(() => import("@/components/JitterHeadline"), { ssr: false })
const GlassCard = dynamic(() => import("@/components/GlassCard"), { ssr: false })
const CursorReveal = dynamic(() => import("@/components/CursorReveal"), { ssr: false })

export default function HeroSection() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible")
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll(".section-reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-center relative">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(232,163,61,0.08) 0%, transparent 70%)",
      }} />
      <div className="relative">
        <div className="animate-blur-in">
          <JitterHeadline text="See the reasoning." className="text-5xl md:text-7xl lg:text-8xl text-paper mb-4" />
          <JitterHeadline text="Not just the ranking." as="h2" className="text-4xl md:text-6xl lg:text-7xl text-signal-amber mb-8" />
        </div>
        <p className="text-paper/50 text-lg max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          Explainable AI that parses, scores, and matches resumes — then shows you exactly why.
        </p>
        <div className="flex items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <Link href="/register" className="px-6 py-3 rounded-xl bg-signal-amber text-ink font-semibold hover:brightness-110 transition-all glow-amber">Start Hiring Smarter</Link>
          <a href="#how-it-works" className="px-6 py-3 rounded-xl glass text-paper/80 hover:text-paper transition-all">See How It Works</a>
        </div>

        <div className="mt-16 max-w-md mx-auto animate-fade-up" style={{ animationDelay: "0.7s" }}>
          <CursorReveal
            frostContent={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-6xl font-mono font-semibold text-paper/40" style={{ filter: "blur(4px)" }}>94%</p>
                  <p className="text-sm text-paper/30 mt-1" style={{ filter: "blur(4px)" }}>Match Score</p>
                </div>
              </div>
            }
          >
            <GlassCard className="text-left">
              <div className="flex items-center justify-between mb-4">
                <p className="text-5xl font-mono font-semibold text-signal-amber">94%</p>
                <span className="text-sm text-verified-teal font-mono">✔ Match</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>React</span><span className="text-verified-teal">✔ Matched</span></div>
                <div className="flex justify-between"><span>TypeScript</span><span className="text-verified-teal">✔ Matched</span></div>
                <div className="flex justify-between"><span>GraphQL</span><span className="text-flag-coral">✖ Gap</span></div>
                <div className="flex justify-between"><span>Docker</span><span className="text-verified-teal">✔ Matched</span></div>
              </div>
            </GlassCard>
          </CursorReveal>
          <p className="text-xs text-paper/30 text-center mt-3">Move your cursor over the card</p>
        </div>
      </div>
    </section>
  )
}

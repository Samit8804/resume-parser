"use client"

import { useRef, useCallback, ReactNode } from "react"

interface JitterHeadlineProps {
  text: string
  as?: "h1" | "h2" | "h3"
  className?: string
}

export default function JitterHeadline({ text, as: Tag = "h1", className = "" }: JitterHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null)

  const handleHover = useCallback(() => {
    if (!ref.current) return
    const words = ref.current.querySelectorAll(".headline-word")
    words.forEach((word) => {
      const w = word as HTMLElement
      w.style.transition = "all 150ms cubic-bezier(0.2,0.8,0.2,1)"
      w.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px) rotate(${Math.random() * 2 - 1}deg)`
      setTimeout(() => {
        w.style.transform = ""
      }, 200)
    })
  }, [])

  const chars = text.split("").map((char, i) => {
    const dx = Math.random() * 16 - 8
    const dy = Math.random() * 16 - 8
    const dr = Math.random() * 6 - 3
    return (
      <span
        key={i}
        className="headline-char inline-block"
        style={{
          animation: `jitter-in 350ms cubic-bezier(0.2,0.8,0.2,1) both`,
          animationDelay: `${i * 18}ms`,
          "--dx": `${dx}px`,
          "--dy": `${dy}px`,
          "--dr": `${dr}deg`,
        } as React.CSSProperties}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    )
  })

  const words = text.split(" ").map((word, i) => (
    <span key={i} className="headline-word inline-block" style={{ display: "inline-block" }}>
      {i > 0 ? "\u00A0" : ""}
      {word}
    </span>
  ))

  return (
    <Tag
      ref={ref}
      onMouseEnter={handleHover}
      className={`font-display leading-tight ${className}`}
      aria-label={text}
    >
      {words}
    </Tag>
  )
}

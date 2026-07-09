"use client"

import { useRef, useState, useEffect, ReactNode } from "react"

interface CursorRevealProps {
  children: ReactNode
  frostContent?: ReactNode
  radius?: number
}

export default function CursorReveal({ children, frostContent, radius = 120 }: CursorRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: -999, y: -999 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleLeave = () => {
    if (!isTouch) setPos({ x: -999, y: -999 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={() => isTouch && setPos({ x: 9999, y: 9999 })}
      className="relative overflow-hidden rounded-xl"
      style={{ touchAction: "manipulation" }}
    >
      {frostContent && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            WebkitMaskImage: isTouch
              ? undefined
              : `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, transparent 0%, black 100%)`,
            maskImage: isTouch
              ? undefined
              : `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, transparent 0%, black 100%)`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            transition: isTouch ? "opacity 0.4s ease" : undefined,
            opacity: isTouch && pos.x > 9000 ? 1 : undefined,
          }}
        >
          {frostContent}
        </div>
      )}
      {children}
    </div>
  )
}

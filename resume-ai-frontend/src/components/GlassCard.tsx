import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export default function GlassCard({ children, className = "", hover = false, glow = false }: GlassCardProps) {
  return (
    <div
      className={`glass rounded-xl p-6 ${hover ? "glass-hover cursor-pointer" : ""} ${glow ? "glow-amber" : ""} transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  )
}

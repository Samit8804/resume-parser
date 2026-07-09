import { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "outline" | "success" | "warning" | "error"
  className?: string
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-frost-900 text-paper/80",
    outline: "border border-frost-300/20 text-paper/60",
    success: "bg-verified-teal/10 text-verified-teal",
    warning: "bg-signal-amber/10 text-signal-amber",
    error: "bg-flag-coral/10 text-flag-coral",
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

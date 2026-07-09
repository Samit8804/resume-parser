import { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "default" | "lg" | "icon"
  children: ReactNode
}

export function Button({ variant = "default", size = "default", className = "", children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none"

  const variants: Record<string, string> = {
    default: "bg-signal-amber text-ink hover:brightness-110",
    outline: "glass text-paper/70 hover:text-paper hover:bg-frost-900/50",
    ghost: "text-paper/50 hover:text-paper hover:bg-frost-900/50",
    destructive: "bg-flag-coral/10 text-flag-coral hover:bg-flag-coral/20",
  }

  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-9 w-9",
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

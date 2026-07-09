import { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full h-10 rounded-lg bg-frost-900 border border-frost-300/20 px-3 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-signal-amber/50 focus:ring-1 focus:ring-signal-amber/20 transition-all ${className}`}
      {...props}
    />
  )
}

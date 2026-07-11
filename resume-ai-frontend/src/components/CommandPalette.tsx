"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

const commands = [
  { id: "dashboard", label: "Go to Dashboard", href: "/dashboard" },
  { id: "jobs", label: "View Jobs", href: "/dashboard/jobs" },
  { id: "new-job", label: "Create New Job", href: "/dashboard/jobs/new" },
  { id: "emails", label: "Email History", href: "/dashboard/emails" },
  { id: "compose", label: "Compose Email", href: "/dashboard/emails/compose" },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
    }
  }, [open])

  const select = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[200] bg-ink/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg glass-strong rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-frost-300/20">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages..."
                className="w-full bg-transparent text-paper placeholder:text-paper/30 text-sm focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    select(filtered[0].href)
                  }
                }}
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
              {filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => select(cmd.href)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-paper/80 hover:bg-frost-900 hover:text-paper transition-colors"
                >
                  {cmd.label}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-sm text-paper/30 text-center">No results</p>
              )}
            </div>
            <div className="p-2 border-t border-frost-300/20 flex gap-3 px-3 py-2 text-xs text-paper/30">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

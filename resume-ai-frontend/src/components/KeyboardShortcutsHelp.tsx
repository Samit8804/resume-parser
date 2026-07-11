"use client"

import { useEffect } from "react"

const groups = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: "g then d", label: "Go to Dashboard" },
      { keys: "g then j", label: "Go to Jobs" },
      { keys: "g then e", label: "Go to Emails" },
      { keys: "g then n", label: "New Job" },
      { keys: "g then c", label: "Compose Email" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: "Ctrl+K", label: "Command palette" },
      { keys: "?", label: "Show this help" },
    ],
  },
]

export function KeyboardShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] bg-ink/60 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="glass-strong rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-paper">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-paper/30 hover:text-paper transition-colors text-sm">ESC</button>
        </div>
        {groups.map((group) => (
          <div key={group.title} className="mb-5 last:mb-0">
            <p className="text-xs text-signal-amber font-mono mb-3">{group.title}</p>
            <div className="space-y-2">
              {group.shortcuts.map((s) => (
                <div key={s.keys} className="flex items-center justify-between">
                  <span className="text-sm text-paper/70">{s.label}</span>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-frost-900 text-paper/50">
                    {s.keys}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

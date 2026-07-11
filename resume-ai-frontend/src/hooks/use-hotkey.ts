"use client"

import { useEffect } from "react"

type HotkeyDef = {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  handler: () => void
}

export function useHotkeys(hotkeys: HotkeyDef[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      for (const hk of hotkeys) {
        const ctrlOrMeta = hk.ctrl || hk.meta
        const modMatch = ctrlOrMeta ? (e.ctrlKey || e.metaKey) : true
        const shiftMatch = hk.shift ? e.shiftKey : !e.shiftKey
        if (modMatch && shiftMatch && e.key.toLowerCase() === hk.key.toLowerCase()) {
          e.preventDefault()
          e.stopPropagation()
          hk.handler()
          return
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [hotkeys])
}

type SequenceStep = { key: string; handler: () => void }

export function useSequenceHotkey(prefix: string, steps: SequenceStep[]) {
  useEffect(() => {
    let waiting = false
    const onKeyDown = (e: KeyboardEvent) => {
      if (waiting) {
        for (const s of steps) {
          if (e.key.toLowerCase() === s.key.toLowerCase()) {
            e.preventDefault()
            waiting = false
            s.handler()
            return
          }
        }
        waiting = false
        return
      }
      if (e.key.toLowerCase() === prefix.toLowerCase() && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        waiting = true
        setTimeout(() => { waiting = false }, 800)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [prefix, steps])
}

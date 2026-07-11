"use client"

import { useState, useCallback } from "react"

export function useSelection(allIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelected(new Set(allIds))
  }, [allIds])

  const deselectAll = useCallback(() => {
    setSelected(new Set())
  }, [])

  const isSelected = useCallback((id: string) => selected.has(id), [selected])

  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id))

  const someSelected = selected.size > 0

  const toggleAll = useCallback(() => {
    if (allSelected) deselectAll()
    else selectAll()
  }, [allSelected, selectAll, deselectAll])

  return { selected, toggle, selectAll, deselectAll, isSelected, allSelected, someSelected, toggleAll, count: selected.size }
}

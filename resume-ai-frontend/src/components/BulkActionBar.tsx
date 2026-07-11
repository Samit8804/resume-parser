"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { candidatesApi } from "@/lib/api"
import { downloadCsv } from "@/lib/export-csv"

interface BulkActionBarProps {
  selectedIds: string[]
  selectedData: Record<string, any>[]
  jobId: string
  onDeselectAll: () => void
  onRefresh: () => void
  compareUrl: string | null
  emailUrl: string | null
}

export function BulkActionBar({ selectedIds, selectedData, jobId, onDeselectAll, onRefresh, compareUrl, emailUrl }: BulkActionBarProps) {
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [changingStatus, setChangingStatus] = useState(false)
  const [addingNote, setAddingNote] = useState(false)

  const handleStatusChange = async (status: string) => {
    setChangingStatus(true)
    try {
      await Promise.all(selectedIds.map((cid) => candidatesApi.updateStatus(cid, status, jobId)))
      onRefresh()
    } catch (e) {
      console.error(e)
    } finally {
      setChangingStatus(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      await Promise.all(selectedIds.map((cid) => candidatesApi.addNote(cid, noteText.trim())))
      setNoteText("")
      setShowNoteModal(false)
      onRefresh()
    } catch (e) {
      console.error(e)
    } finally {
      setAddingNote(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 border border-frost-300/20">
        <span className="text-sm text-paper/70 font-mono mr-1">{selectedIds.length} selected</span>

        <div className="w-px h-6 bg-frost-300/20" />

        {compareUrl && (
          <a href={compareUrl}>
            <Button variant="outline" size="sm">Compare</Button>
          </a>
        )}

        {emailUrl && (
          <a href={emailUrl}>
            <Button variant="outline" size="sm">Email</Button>
          </a>
        )}

        <select
          className="h-8 rounded-lg border border-frost-300/20 bg-frost-900 px-2 text-xs text-paper focus:outline-none"
          defaultValue=""
          disabled={changingStatus}
          onChange={(e) => { if (e.target.value) handleStatusChange(e.target.value) }}
        >
          <option value="">Change status...</option>
          <option value="NEW">New</option>
          <option value="SCREENING">Screening</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFERED">Offered</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <Button variant="outline" size="sm" onClick={() => setShowNoteModal(true)}>Add Note</Button>

        <div className="w-px h-6 bg-frost-300/20" />

        <Button variant="outline" size="sm" onClick={() => {
          downloadCsv(selectedData, `candidates_${jobId}`)
        }}>CSV</Button>

        <div className="w-px h-6 bg-frost-300/20" />

        <button onClick={onDeselectAll} className="text-xs text-paper/30 hover:text-paper/70 transition-colors">Clear</button>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowNoteModal(false)}>
          <div className="glass-strong rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg text-paper mb-4">Add Note to {selectedIds.length} Candidate{selectedIds.length !== 1 ? "s" : ""}</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note..."
              className="w-full h-24 rounded-lg border border-frost-300/20 bg-frost-900 px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:ring-1 focus:ring-signal-amber/20 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => setShowNoteModal(false)}>Cancel</Button>
              <Button variant="default" size="sm" disabled={!noteText.trim() || addingNote} onClick={handleAddNote}>
                {addingNote ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

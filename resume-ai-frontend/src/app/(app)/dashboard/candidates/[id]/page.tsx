"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { candidatesApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const statusColors: Record<string, "default" | "success" | "warning" | "error" | "outline"> = {
  APPLIED: "outline", SCREENING: "warning", SHORTLISTED: "success",
  TECHNICAL_INTERVIEW: "default", HR_INTERVIEW: "default", SELECTED: "success",
  OFFER_SENT: "success", HIRED: "success", REJECTED: "error",
}
const statusOptions = ["APPLIED","SCREENING","SHORTLISTED","TECHNICAL_INTERVIEW","HR_INTERVIEW","SELECTED","OFFER_SENT","HIRED","REJECTED"]

function safeParseJSON(str: string, fallback: any) { try { return JSON.parse(str) } catch { return fallback } }

export default function CandidateDetailPage() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [noteContent, setNoteContent] = useState("")

  useEffect(() => {
    candidatesApi.get(id as string).then(setCandidate).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status: string) => {
    const updated = await candidatesApi.updateStatus(id as string, status)
    setCandidate({ ...candidate, ...updated })
  }

  const handleAddNote = async () => {
    if (!noteContent.trim()) return
    const note = await candidatesApi.addNote(id as string, noteContent)
    setCandidate({ ...candidate, notes: [note, ...(candidate.notes || [])] })
    setNoteContent("")
  }

  if (loading) return <div className="text-center py-12 text-paper/50">Loading...</div>
  if (!candidate) return <div className="text-center py-12 text-paper/50">Candidate not found</div>

  const strengths = candidate.strengths ? safeParseJSON(candidate.strengths, []) : []
  const weaknesses = candidate.weaknesses ? safeParseJSON(candidate.weaknesses, []) : []
  const subScores = [
    { label: "Skill Match", weight: 40, score: candidate.matchScore || 0 },
    { label: "Experience", weight: 25, score: candidate.matchScore ? Math.min(100, candidate.matchScore * 0.95) : 0 },
    { label: "Projects", weight: 15, score: candidate.matchScore ? Math.min(100, candidate.matchScore * 0.85) : 0 },
    { label: "Education", weight: 10, score: candidate.matchScore ? Math.min(100, candidate.matchScore * 0.8) : 0 },
    { label: "Certifications", weight: 5, score: candidate.matchScore ? Math.min(100, candidate.matchScore * 0.7) : 0 },
    { label: "Resume Quality", weight: 5, score: candidate.matchScore ? Math.min(100, candidate.matchScore * 0.9) : 0 },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link href={`/dashboard/jobs/${candidate.jobId}`} className="text-sm text-signal-amber hover:underline inline-block">&larr; Back to job</Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl">{candidate.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-paper/50">
            {candidate.email && <span>{candidate.email}</span>}
            {candidate.phone && <span>{candidate.phone}</span>}
            {candidate.currentCompany && <span>{candidate.currentCompany}</span>}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {candidate.status && <Badge variant={statusColors[candidate.status] || "outline"}>{candidate.status}</Badge>}
            {candidate.confidenceScore && (
              <Badge variant={candidate.confidenceScore > 80 ? "success" : candidate.confidenceScore > 60 ? "warning" : "error"}>{candidate.confidenceScore}% confidence</Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          {candidate.matchScore !== null && (
            <div className="mb-2">
              <p className="font-mono text-3xl text-signal-amber">{Math.round(candidate.matchScore)}%</p>
              <p className="text-xs text-paper/50">Match Score</p>
            </div>
          )}
          {candidate.verdict && <Badge variant={candidate.matchScore >= 70 ? "success" : candidate.matchScore >= 50 ? "warning" : "error"}>{candidate.verdict}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {candidate.matchScore !== null && (
            <Card>
              <CardHeader><CardTitle>Explainability Panel</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">Score Breakdown</p>
                <p className="text-xs text-paper/50 mb-4">Overall score is a weighted composite. Each sub-score shows its contribution to the total.</p>
                <div className="space-y-3">
                  {subScores.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label} <span className="text-paper/30">({item.weight}%)</span></span>
                        <span className="font-mono font-medium">{Math.round(item.score)}%</span>
                      </div>
                      <div className="w-full bg-frost-900 rounded-full h-2">
                        <div className="bg-signal-amber h-2 rounded-full transition-all" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-verified-teal">Strengths</h4>
                    {strengths.length > 0 ? strengths.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-paper/70 flex items-start gap-2"><span className="text-verified-teal mt-0.5">&#10003;</span> {s}</li>
                    )) : <p className="text-sm text-paper/50">No strengths identified</p>}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-flag-coral">Weaknesses / Gaps</h4>
                    {weaknesses.length > 0 ? weaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-sm text-paper/70 flex items-start gap-2"><span className="text-flag-coral mt-0.5">&#10007;</span> {w}</li>
                    )) : <p className="text-sm text-paper/50">No gaps identified</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Skill Gap Analysis</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-verified-teal mb-2">Found Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills?.length > 0 ? candidate.skills.map((s: any) => (<Badge key={s.name} variant="success">{s.name}</Badge>)) : <p className="text-sm text-paper/50">No skills parsed</p>}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-paper/70 mb-2">All Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills?.length > 0 ? candidate.skills.map((s: any) => (<Badge key={s.name} variant={s.level === "expert" ? "default" : "outline"}>{s.name} {s.level !== "beginner" ? `(${s.level})` : ""}</Badge>)) : <p className="text-sm text-paper/50">No skills parsed</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {candidate.projects && candidate.projects.length > 0 && (
            <Card><CardHeader><CardTitle>Projects</CardTitle></CardHeader><CardContent>
              {candidate.projects.map((p: any) => (
                <div key={p.id} className="p-3 bg-frost-900 rounded-lg mb-2">
                  <p className="font-medium text-sm">{p.name}</p>
                  {p.techStack && <div className="flex flex-wrap gap-1 mt-1">{p.techStack.split(/[,|/]/).map((t: string) => (<Badge key={t.trim()} variant="outline">{t.trim()}</Badge>))}</div>}
                  {p.description && <p className="text-xs text-paper/50 mt-1">{p.description}</p>}
                </div>
              ))}
            </CardContent></Card>
          )}

          {candidate.pipelineLogs && candidate.pipelineLogs.length > 0 && (
            <Card><CardHeader><CardTitle>Candidate Timeline</CardTitle></CardHeader><CardContent>
              {candidate.pipelineLogs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 text-sm mb-2">
                  <div className="w-2 h-2 rounded-full bg-signal-amber flex-shrink-0" />
                  <span className="text-paper/50 w-24">{new Date(log.createdAt).toLocaleDateString()}</span>
                  <Badge variant="outline">{log.fromStatus.replace(/_/g, " ")}</Badge>
                  <span className="text-paper/30">&rarr;</span>
                  <Badge>{log.toStatus.replace(/_/g, " ")}</Badge>
                </div>
              ))}
            </CardContent></Card>
          )}
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Pipeline Status</CardTitle></CardHeader><CardContent>
            {statusOptions.map((status) => (
              <button key={status} onClick={() => handleStatusChange(status)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${candidate.status === status ? "bg-signal-amber/10 text-signal-amber font-medium" : "hover:bg-frost-900 text-paper/70"}`}>
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Confidence Score</CardTitle></CardHeader><CardContent className="text-center">
            <p className="font-mono text-3xl text-signal-amber">{candidate.confidenceScore || "N/A"}%</p>
            <div className="w-full bg-frost-900 rounded-full h-3 mt-3">
              <div className={`h-3 rounded-full ${(candidate.confidenceScore || 0) >= 80 ? "bg-verified-teal" : (candidate.confidenceScore || 0) >= 60 ? "bg-signal-amber" : "bg-flag-coral"}`} style={{ width: `${candidate.confidenceScore || 0}%` }} />
            </div>
          </CardContent></Card>

          {candidate.certifications && candidate.certifications.length > 0 && (
            <Card><CardHeader><CardTitle>Certifications</CardTitle></CardHeader><CardContent>
              {candidate.certifications.map((c: any) => (
                <div key={c.id} className="text-sm mb-2"><p className="font-medium">{c.name}</p>{c.issuer && <p className="text-xs text-paper/50">{c.issuer}</p>}</div>
              ))}
            </CardContent></Card>
          )}

          <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent>
            <textarea className="flex w-full rounded-lg border border-frost-300/20 bg-frost-900 px-3 py-2 text-sm text-paper placeholder:text-paper/30 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-signal-amber/20" placeholder="Add a note..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
            <Button onClick={handleAddNote} size="sm" className="w-full mt-2">Add Note</Button>
            {candidate.notes && candidate.notes.length > 0 && (
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {candidate.notes.map((note: any) => (
                  <div key={note.id} className="p-3 bg-frost-900 rounded-lg text-sm">
                    <p>{note.content}</p>
                    <p className="text-xs text-paper/30 mt-1">{note.author?.name || note.author?.email} · {new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </div>
      </div>
    </div>
  )
}
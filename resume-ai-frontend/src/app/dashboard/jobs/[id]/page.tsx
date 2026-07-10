"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { jobsApi, uploadApi, insightsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function JobDetailPage() {
  const { id } = useParams()
  const [job, setJob] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [filterScore, setFilterScore] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const fetchJob = () => {
    setLoading(true)
    jobsApi.get(id as string).then((j) => {
      if (!mountedRef.current) return
      setJob(j)
      insightsApi.get(id as string).then(setInsights).catch(() => {})
    }).catch(console.error).finally(() => {
      if (mountedRef.current) setLoading(false)
    })
  }

  useEffect(() => { fetchJob() }, [id])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError("")
    try {
      const formData = new FormData()
      formData.append("jobId", id as string)
      Array.from(files).forEach((f) => formData.append("resumes", f))
      await uploadApi.bulkUpload(formData)
      timeoutRef.current = setTimeout(fetchJob, 2000)
    } catch (err: any) {
      setUploadError(err.message || "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const toggleSelect = (candidateId: string) => {
    const next = new Set(selectedCandidates)
    if (next.has(candidateId)) next.delete(candidateId)
    else next.add(candidateId)
    setSelectedCandidates(next)
  }

  if (loading) return <div className="text-center py-12 text-paper/50">Loading...</div>
  if (!job) return <div className="text-center py-12 text-paper/50">Job not found</div>

  const candidates = (job.candidates || []).filter((c: any) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterScore && (c.matchScore || 0) < parseFloat(filterScore)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-signal-amber hover:underline mb-2 inline-block">&larr; Back</Link>
          <h1 className="font-display text-2xl">{job.title}</h1>
          <p className="text-paper/50 mt-1">
            {[job.department, job.location, job.type].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedCandidates.size >= 2 && selectedCandidates.size <= 4 && (
            <Link href={`/dashboard/compare?ids=${Array.from(selectedCandidates).join(",")}&jobId=${id}`}>
              <Button variant="outline">Compare ({selectedCandidates.size})</Button>
            </Link>
          )}
          {selectedCandidates.size >= 1 && (
            <Link href={`/dashboard/emails/compose?candidateIds=${Array.from(selectedCandidates).join(",")}`}>
              <Button variant="outline">Email ({selectedCandidates.size})</Button>
            </Link>
          )}
          {(job.applicationMethod === "MANUAL_UPLOAD" || job.applicationMethod === "BOTH") && (
            <>
              <Button variant="default" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? "Uploading..." : "Upload Resumes"}
              </Button>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx" className="hidden" onChange={handleUpload} />
            </>
          )}
        </div>
      </div>

      {uploadError && <div className="p-3 text-sm bg-flag-coral/10 border border-flag-coral/30 text-flag-coral rounded-lg">{uploadError}</div>}

      {(job.applicationMethod === "PUBLIC_LINK" || job.applicationMethod === "BOTH") && job.slug && (
        <Card className="border-signal-amber/30 bg-signal-amber/10">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-1">Public Application Link</p>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-frost-900 px-3 py-1.5 rounded border border-frost-300/20 flex-1">
                {typeof window !== "undefined" ? `${window.location.origin}/jobs/${job.slug}` : `/jobs/${job.slug}`}
              </code>
              <Button size="sm" variant="outline" onClick={() => {
                const url = `${window.location.origin}/jobs/${job.slug}`
                navigator.clipboard.writeText(url)
              }}>Copy Link</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {job.skills && job.skills.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s: any) => (
                <Badge key={s.name} variant={s.isRequired ? "default" : "outline"}>
                  {s.name} {s.isRequired ? "" : "(preferred)"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {insights && candidates.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="font-mono text-2xl text-signal-amber">{insights.totalCandidates}</p>
            <p className="text-xs text-paper/50">Total Candidates</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="font-mono text-2xl text-signal-amber">{insights.avgMatchScore}%</p>
            <p className="text-xs text-paper/50">Avg Match Score</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="font-mono text-2xl text-signal-amber">{insights.avgExperience}y</p>
            <p className="text-xs text-paper/50">Avg Experience</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="font-mono text-2xl text-signal-amber">{insights.mostCommonSkill || "N/A"}</p>
            <p className="text-xs text-paper/50">Most Common Skill</p>
          </CardContent></Card>
        </div>
      )}

      {insights?.missingSkillAnalysis && insights.missingSkillAnalysis.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Skill Gap Analysis</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.missingSkillAnalysis.map((s: any) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-sm w-32 font-medium">{s.name}</span>
                  <div className="flex-1 bg-frost-900 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${s.missingPercent > 50 ? "bg-flag-coral" : s.missingPercent > 20 ? "bg-signal-amber" : "bg-verified-teal"}`} style={{ width: `${s.missingPercent}%` }} />
                  </div>
                  <span className="font-mono text-xs text-paper/50 w-20 text-right">{s.missingCount} missing ({s.missingPercent}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Candidates ({candidates.length})</h2>
          <div className="flex gap-2">
            <input className="h-9 rounded-lg border border-frost-300/20 bg-frost-900 px-3 text-sm text-paper placeholder:text-paper/30 w-48 focus:outline-none focus:ring-1 focus:ring-signal-amber/20" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="h-9 rounded-lg border border-frost-300/20 bg-frost-900 px-3 text-sm text-paper" value={filterScore} onChange={(e) => setFilterScore(e.target.value)}>
              <option value="">All scores</option>
              <option value="80">80%+</option>
              <option value="60">60%+</option>
              <option value="40">40%+</option>
            </select>
          </div>
        </div>
        {candidates.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <p className="text-paper/50">No candidates found. Upload resumes to get started.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate: any) => (
              <div key={candidate.id} className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" checked={selectedCandidates.has(candidate.id)} onChange={() => toggleSelect(candidate.id)} />
                <Link href={`/dashboard/candidates/${candidate.id}`} className="flex-1">
                  <Card className="glass-hover transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        <p className="text-sm text-paper/50">{candidate.email} {candidate.currentCompany ? `· ${candidate.currentCompany}` : ""}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills?.slice(0, 5).map((s: any) => (<Badge key={s.name} variant="outline">{s.name}</Badge>))}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {candidate.confidenceScore && (
                          <Badge variant={candidate.confidenceScore > 80 ? "success" : candidate.confidenceScore > 60 ? "warning" : "error"}>{candidate.confidenceScore}% conf</Badge>
                        )}
                        {candidate.matchScore !== null && <p className="font-mono text-2xl text-signal-amber">{Math.round(candidate.matchScore)}%</p>}
                        <Badge>{candidate.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
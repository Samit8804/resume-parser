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

  const fetchJob = () => {
    setLoading(true)
    jobsApi.get(id as string).then((j) => {
      setJob(j)
      insightsApi.get(id as string).then(setInsights).catch(() => {})
    }).catch(console.error).finally(() => setLoading(false))
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
      setTimeout(fetchJob, 2000)
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

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>

  const candidates = (job.candidates || []).filter((c: any) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterScore && (c.matchScore || 0) < parseFloat(filterScore)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back</Link>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-gray-500 mt-1">
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

      {uploadError && <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">{uploadError}</div>}

      {(job.applicationMethod === "PUBLIC_LINK" || job.applicationMethod === "BOTH") && job.slug && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-1">Public Application Link</p>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-white px-3 py-1.5 rounded border flex-1">
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
            <p className="text-2xl font-bold text-blue-600">{insights.totalCandidates}</p>
            <p className="text-xs text-gray-500">Total Candidates</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{insights.avgMatchScore}%</p>
            <p className="text-xs text-gray-500">Avg Match Score</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{insights.avgExperience}y</p>
            <p className="text-xs text-gray-500">Avg Experience</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{insights.mostCommonSkill || "N/A"}</p>
            <p className="text-xs text-gray-500">Most Common Skill</p>
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
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${s.missingPercent > 50 ? "bg-red-500" : s.missingPercent > 20 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${s.missingPercent}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{s.missingCount} missing ({s.missingPercent}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Candidates ({candidates.length})</h2>
          <div className="flex gap-2">
            <input className="h-9 rounded-lg border border-gray-300 px-3 text-sm w-48" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white" value={filterScore} onChange={(e) => setFilterScore(e.target.value)}>
              <option value="">All scores</option>
              <option value="80">80%+</option>
              <option value="60">60%+</option>
              <option value="40">40%+</option>
            </select>
          </div>
        </div>
        {candidates.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <p className="text-gray-500">No candidates found. Upload resumes to get started.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate: any) => (
              <div key={candidate.id} className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" checked={selectedCandidates.has(candidate.id)} onChange={() => toggleSelect(candidate.id)} />
                <Link href={`/dashboard/candidates/${candidate.id}`} className="flex-1">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        <p className="text-sm text-gray-500">{candidate.email} {candidate.currentCompany ? `· ${candidate.currentCompany}` : ""}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills?.slice(0, 5).map((s: any) => (<Badge key={s.name} variant="outline">{s.name}</Badge>))}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {candidate.confidenceScore && (
                          <Badge variant={candidate.confidenceScore > 80 ? "success" : candidate.confidenceScore > 60 ? "warning" : "error"}>{candidate.confidenceScore}% conf</Badge>
                        )}
                        {candidate.matchScore !== null && <p className="text-2xl font-bold text-blue-600">{Math.round(candidate.matchScore)}%</p>}
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

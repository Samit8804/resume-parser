"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { publicApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PublicJobPage() {
  const { slug } = useParams()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", email: "", phone: "", linkedIn: "", github: "",
    portfolio: "", currentCompany: "", currentCtc: "", expectedCtc: "",
    noticePeriod: "", coverLetter: "",
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  useEffect(() => {
    publicApi.getJob(slug as string).then(setJob).catch(() => setError("Job not found")).finally(() => setLoading(false))
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { setError("Name and email are required"); return }
    setSubmitting(true)
    setError("")
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v) })
      if (resumeFile) fd.append("resume", resumeFile)
      const result = await publicApi.apply(slug as string, fd)
      if (result.error) { setError(result.error); return }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Application failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (error && !job) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!job) return <div className="text-center py-20 text-gray-500">Job not found</div>

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-5xl">✓</div>
            <h1 className="text-2xl font-bold text-green-700">Application Submitted!</h1>
            <p className="text-gray-600">
              Thank you, <strong>{form.name}</strong>. Your application for <strong>{job.title}</strong> has been received successfully.
            </p>
            <p className="text-gray-500 text-sm">We will review your application and get back to you soon.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 py-8 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            {job.company?.logo && <img src={job.company.logo} alt={job.company.name} className="h-12 w-auto" />}
            {job.company?.name && <p className="text-sm text-gray-500 font-medium">{job.company.name}</p>}
            <h1 className="text-3xl font-bold">{job.title}</h1>
            {job.description && <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {job.type && <div><span className="font-medium">Type:</span> {job.type}</div>}
              {job.location && <div><span className="font-medium">Location:</span> {job.location}</div>}
              {job.experienceMin != null && <div><span className="font-medium">Experience:</span> {job.experienceMin}{job.experienceMax ? ` - ${job.experienceMax}` : "+"} years</div>}
              {job.salaryMin != null && <div><span className="font-medium">Salary:</span> ${job.salaryMin?.toLocaleString()}{job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : "+"}</div>}
              {job.department && <div><span className="font-medium">Department:</span> {job.department}</div>}
              {job.deadline && <div><span className="font-medium">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}</div>}
            </div>
            {job.skills?.length > 0 && (
              <div>
                <p className="font-medium mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s: any) => (
                    <Badge key={s.name} variant={s.isRequired ? "default" : "outline"}>{s.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {job.benefits && <div><span className="font-medium">Benefits:</span> {job.benefits}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Apply for this Position</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <Label>Email Address *</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>LinkedIn URL</Label>
                  <Input placeholder="https://linkedin.com/in/..." value={form.linkedIn} onChange={e => setForm({...form, linkedIn: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>GitHub URL</Label>
                  <Input placeholder="https://github.com/..." value={form.github} onChange={e => setForm({...form, github: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Portfolio Website</Label>
                  <Input value={form.portfolio} onChange={e => setForm({...form, portfolio: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Current Company</Label>
                  <Input value={form.currentCompany} onChange={e => setForm({...form, currentCompany: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Current CTC</Label>
                  <Input type="number" value={form.currentCtc} onChange={e => setForm({...form, currentCtc: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Expected CTC</Label>
                  <Input type="number" value={form.expectedCtc} onChange={e => setForm({...form, expectedCtc: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Notice Period</Label>
                  <Input placeholder="e.g. 30 days" value={form.noticePeriod} onChange={e => setForm({...form, noticePeriod: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Resume (PDF/DOCX) *</Label>
                  <Input type="file" accept=".pdf,.docx" onChange={e => setResumeFile(e.target.files?.[0] || null)} required />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Cover Letter (Optional)</Label>
                  <textarea
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.coverLetter} onChange={e => setForm({...form, coverLetter: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

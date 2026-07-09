"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { jobsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    department: "",
    type: "",
    location: "",
    description: "",
    experienceMin: 0,
    experienceMax: 10,
    salaryMin: 0,
    salaryMax: 0,
    education: "",
    applicationMethod: "BOTH",
    skills: [{ name: "", isRequired: true, category: "technical" }],
  })

  const addSkill = () => {
    setForm({ ...form, skills: [...form.skills, { name: "", isRequired: true, category: "technical" }] })
  }

  const updateSkill = (index: number, field: string, value: any) => {
    const skills = [...form.skills]
    ;(skills[index] as any)[field] = value
    setForm({ ...form, skills })
  }

  const removeSkill = (index: number) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = {
        ...form,
        skills: form.skills.filter((s) => s.name.trim()),
        experienceMin: form.experienceMin || undefined,
        experienceMax: form.experienceMax || undefined,
      }
      const job = await jobsApi.create(data)
      router.push(`/dashboard/jobs/${job.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to create job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl mb-6">Create New Job</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm bg-flag-coral/10 border border-flag-coral/30 text-flag-coral rounded-lg">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Job Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input placeholder="Full-time" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Education Required</Label>
                <Input placeholder="Bachelor's in CS" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Min Experience (years)</Label>
                <Input type="number" min="0" value={form.experienceMin} onChange={(e) => setForm({ ...form, experienceMin: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Max Experience (years)</Label>
                <Input type="number" min="0" value={form.experienceMax} onChange={(e) => setForm({ ...form, experienceMax: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Min Salary</Label>
                <Input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Max Salary</Label>
                <Input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Application Method</Label>
                <select
                  className="w-full h-10 rounded-lg bg-frost-900 border border-frost-300/20 px-3 text-sm text-paper"
                  value={form.applicationMethod}
                  onChange={(e) => setForm({ ...form, applicationMethod: e.target.value })}
                >
                  <option value="BOTH">Public Link + Manual Upload</option>
                  <option value="PUBLIC_LINK">Public Application Link Only</option>
                  <option value="MANUAL_UPLOAD">Manual Resume Upload Only</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Job Description</Label>
                <textarea
                  className="flex w-full rounded-lg border border-frost-300/20 bg-frost-900 px-3 py-2 text-sm text-paper placeholder:text-paper/30 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-signal-amber/20"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Required Skills</Label>
              {form.skills.map((skill, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    placeholder="Skill name"
                    value={skill.name}
                    onChange={(e) => updateSkill(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  <select
                    className="h-10 rounded-lg bg-frost-900 border border-frost-300/20 px-3 text-sm text-paper"
                    value={skill.isRequired ? "required" : "preferred"}
                    onChange={(e) => updateSkill(i, "isRequired", e.target.value === "required")}
                  >
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                  </select>
                  {form.skills.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeSkill(i)}>
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                + Add Skill
              </Button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Job"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
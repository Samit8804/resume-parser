"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { jobsApi, insightsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CardSkeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [insights, setInsights] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobsApi.list().then(async (jobsList) => {
      setJobs(jobsList)
      const insightsMap: Record<string, any> = {}
      await Promise.all(jobsList.map(async (job) => {
        try { insightsMap[job.id] = await insightsApi.get(job.id) } catch {}
      }))
      setInsights(insightsMap)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const totalCandidates = jobs.reduce((sum, j) => sum + (j._count?.candidates || 0), 0)
  const activeJobs = jobs.filter(j => j.status === "ACTIVE").length
  const avgScore = jobs.reduce((sum, j) => {
    const ins = insights[j.id]
    return sum + (ins?.avgMatchScore || 0)
  }, 0) / (jobs.length || 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Dashboard</h1>
          <p className="text-paper/50 mt-1">Overview of your recruitment pipeline</p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button>Create Job</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="font-display text-2xl text-signal-amber">{activeJobs}</p>
          <p className="text-xs text-paper/50">Active Jobs</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="font-display text-2xl text-signal-amber">{totalCandidates}</p>
          <p className="text-xs text-paper/50">Total Candidates</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="font-mono text-2xl text-signal-amber">{Math.round(avgScore)}%</p>
          <p className="text-xs text-paper/50">Avg Match Score</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="font-display text-2xl text-signal-amber">{jobs.length}</p>
          <p className="text-xs text-paper/50">Total Postings</p>
        </CardContent></Card>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-4xl">📋</p>
            <p className="text-paper/70 font-medium">No jobs yet</p>
            <p className="text-sm text-paper/50">Create your first job posting to start screening candidates.</p>
            <Link href="/dashboard/jobs/new">
              <Button>Create Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            <h2 className="font-display text-lg mt-2">Your Job Postings</h2>
            {jobs.map((job) => {
              const ins = insights[job.id]
              return (
                <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                  <Card className="glass-hover transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-sm text-paper/50 mt-1">
                            {[job.department, job.location, job.type].filter(Boolean).join(" · ") || "No details"}
                          </p>
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {job.skills.slice(0, 6).map((skill: any) => (
                                <Badge key={skill.name} variant={skill.isRequired ? "default" : "outline"}>
                                  {skill.name}
                                </Badge>
                              ))}
                              {job.skills.length > 6 && (
                                <Badge variant="outline">+{job.skills.length - 6} more</Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-mono text-2xl text-signal-amber">{job._count.candidates}</p>
                          <p className="text-xs text-paper/50">candidates</p>
                          {ins && (
                            <p className="text-xs text-paper/50 mt-1">
                              Avg: {ins.avgMatchScore}% · Exp: {ins.avgExperience}y
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {jobs.map((job) => {
            const ins = insights[job.id]
            if (!ins?.missingSkillAnalysis?.length) return null
            const criticalGaps = ins.missingSkillAnalysis.filter((s: any) => s.missingPercent > 50)
            if (!criticalGaps.length) return null
            return (
              <Card key={`gaps-${job.id}`}>
                <CardHeader><CardTitle>Smart Insights: {job.title}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-paper/70 mb-3">
                    <span className="font-medium">Critical skill gaps</span> — skills missing from &gt;50% of candidates:
                  </p>
                  <div className="space-y-2">
                    {criticalGaps.map((s: any) => (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-32">{s.name}</span>
                        <div className="flex-1 bg-flag-coral/10 rounded-full h-2.5">
                          <div className="bg-flag-coral h-2.5 rounded-full" style={{ width: `${s.missingPercent}%` }} />
                        </div>
                        <span className="font-mono text-xs text-paper/50 w-20 text-right">{s.missingPercent}% missing</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}
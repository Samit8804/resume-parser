"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { jobsApi, insightsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your recruitment pipeline</p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button>Create Job</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{activeJobs}</p>
          <p className="text-xs text-gray-500">Active Jobs</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalCandidates}</p>
          <p className="text-xs text-gray-500">Total Candidates</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{Math.round(avgScore)}%</p>
          <p className="text-xs text-gray-500">Avg Match Score</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{jobs.length}</p>
          <p className="text-xs text-gray-500">Total Postings</p>
        </CardContent></Card>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No jobs yet. Create your first job posting to start screening candidates.</p>
            <Link href="/dashboard/jobs/new">
              <Button>Create Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold mt-2">Your Job Postings</h2>
            {jobs.map((job) => {
              const ins = insights[job.id]
              return (
                <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
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
                          <p className="text-2xl font-bold text-blue-600">{job._count.candidates}</p>
                          <p className="text-xs text-gray-500">candidates</p>
                          {ins && (
                            <p className="text-xs text-gray-500 mt-1">
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
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Critical skill gaps</span> — skills missing from &gt;50% of candidates:
                  </p>
                  <div className="space-y-2">
                    {criticalGaps.map((s: any) => (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-32">{s.name}</span>
                        <div className="flex-1 bg-red-100 rounded-full h-2.5">
                          <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${s.missingPercent}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-20 text-right">{s.missingPercent}% missing</span>
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
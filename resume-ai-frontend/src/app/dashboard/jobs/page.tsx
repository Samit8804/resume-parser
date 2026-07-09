"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { jobsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobsApi.list().then(setJobs).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Jobs</h1>
          <p className="text-paper/50 mt-1">Manage your job postings</p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button>Create Job</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-paper/50">Loading...</div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-paper/50">No jobs created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
              <Card className="glass-hover transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-paper/50 mt-1">
                      {job.department} {job.location ? `· ${job.location}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills?.slice(0, 4).map((s: any) => (
                        <Badge key={s.name} variant={s.isRequired ? "default" : "outline"}>{s.name}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl text-signal-amber">{job._count?.candidates || 0}</p>
                    <p className="text-xs text-paper/50">{job.status}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
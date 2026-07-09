"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { insightsApi } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = searchParams.get("ids")?.split(",") || []
    if (ids.length < 2) { router.push("/dashboard"); return }
    insightsApi.compare(ids).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [searchParams, router])

  if (loading) return <div className="text-center py-12 text-paper/50">Loading comparison...</div>
  if (!data) return <div className="text-center py-12 text-paper/50">Failed to load comparison</div>

  const { comparison, skillUniverse } = data

  return (
    <div className="space-y-6">
      <Link href={`/dashboard/jobs/${searchParams.get("jobId")}`} className="text-sm text-signal-amber hover:underline inline-block">&larr; Back to job</Link>
      <h1 className="font-display text-2xl">Candidate Comparison</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-frost-300/20">
              <th className="text-left p-3 text-sm font-medium text-paper/50 w-40">Field</th>
              {comparison.map((c: any) => (<th key={c.id} className="p-3 text-left"><Link href={`/dashboard/candidates/${c.id}`} className="text-signal-amber hover:underline font-medium">{c.name}</Link></th>))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Match Score", render: (c: any) => <span className={`font-mono text-lg font-bold ${c.matchScore >= 80 ? "text-verified-teal" : c.matchScore >= 60 ? "text-signal-amber" : "text-flag-coral"}`}>{Math.round(c.matchScore)}%</span> },
              { label: "Email", render: (c: any) => <span className="text-sm">{c.email || "N/A"}</span> },
              { label: "Experience", render: (c: any) => <span className="text-sm">{c.experience || 0} years</span> },
              { label: "Company", render: (c: any) => <span className="text-sm">{c.currentCompany || "N/A"}</span> },
              { label: "Education", render: (c: any) => <span className="text-sm">{c.education || "N/A"}</span> },
              { label: "Skills", render: (c: any) => <div><div className="flex flex-wrap gap-1">{c.skills.map((s: string) => (<Badge key={s} variant="outline">{s}</Badge>))}</div><span className="font-mono text-xs text-paper/30">{c.skillCount} total</span></div> },
              { label: "Projects", render: (c: any) => <span className="text-sm">{c.projectCount} projects</span> },
              { label: "Certifications", render: (c: any) => <span className="text-sm">{c.certificationCount} certifications</span> },
              { label: "Status", render: (c: any) => <Badge>{c.status}</Badge> },
            ].map((row) => (
              <tr key={row.label} className="border-b border-frost-300/20">
                <td className="p-3 text-sm text-paper/50">{row.label}</td>
                {comparison.map((c: any) => (<td key={c.id} className="p-3">{row.render(c)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card><CardHeader><CardTitle>Skill Coverage Matrix</CardTitle></CardHeader><CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-frost-300/20">
              <th className="text-left p-2 text-sm font-medium text-paper/50">Skill</th>
              {comparison.map((c: any) => (<th key={c.id} className="p-2 text-sm text-center">{c.name}</th>))}
            </tr></thead>
            <tbody>
              {skillUniverse.map((skill: string) => (
                <tr key={skill} className="border-b border-frost-300/20">
                  <td className="p-2 text-sm">{skill}</td>
                  {comparison.map((c: any) => (<td key={c.id} className="p-2 text-center">{c.skills.includes(skill) ? <span className="text-verified-teal font-bold">&#10003;</span> : <span className="text-flag-coral/50">&mdash;</span>}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  )
}
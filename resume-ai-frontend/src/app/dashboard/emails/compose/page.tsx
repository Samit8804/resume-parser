"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { emailApi, candidatesApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ComposeEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const candidateIdsParam = searchParams.get("candidateIds")

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [recipient, setRecipient] = useState("")
  const [recipientType, setRecipientType] = useState("single")
  const [selectedCandidates, setSelectedCandidates] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [scheduledAt, setScheduledAt] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    emailApi.getTemplates().then(setTemplates).catch(() => {})
    candidatesApi.list().then(setCandidates).catch(() => {})
  }, [])

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const t = templates.find((t: any) => t.id === templateId)
      if (t) { setSubject(t.subject); setBody(t.body) }
    }
  }, [templateId, templates])

  useEffect(() => {
    if (candidateIdsParam) {
      const ids = candidateIdsParam.split(",")
      setRecipientType("bulk")
      candidatesApi.list().then((all) => {
        const selected = all.filter((c: any) => ids.includes(c.id))
        setSelectedCandidates(selected)
      }).catch(() => {})
    }
  }, [candidateIdsParam])

  const selectTemplate = (id: string) => {
    const t = templates.find((t: any) => t.id === id)
    if (t) { setSubject(t.subject); setBody(t.body) }
  }

  const generateWithAI = async (prompt: string) => {
    setBody(`[AI Generated - Based on prompt: "${prompt}"]
    
Dear {{candidateName}},

This is a professionally drafted email regarding your application for {{jobTitle}} at {{companyName}}.

Best regards,
{{recruiterName}}`)
  }

  const handleSend = async () => {
    setError("")
    setSuccess("")
    if (!subject || !body) { setError("Subject and body are required"); return }

    setSending(true)
    try {
      if (recipientType === "bulk" && selectedCandidates.length > 0) {
        const result = await emailApi.bulkSend({
          candidateIds: selectedCandidates.map((c: any) => c.id),
          subject, body,
          scheduledAt: scheduledAt || undefined,
        })
        setSuccess(`Email sent to ${result.sent} of ${result.total} candidates`)
      } else {
        if (!recipient) { setError("Recipient email is required"); return }
        await emailApi.send({ subject, body, recipient, scheduledAt: scheduledAt || undefined })
        setSuccess("Email sent successfully!")
      }
    } catch (err: any) {
      setError(err.message || "Failed to send email")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Compose Email</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          {error && <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="p-3 text-sm bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}

          <div className="flex gap-4">
            <Label className="flex items-center gap-2">
              <input type="radio" name="recipientType" checked={recipientType === "single"} onChange={() => setRecipientType("single")} />
              Single Recipient
            </Label>
            <Label className="flex items-center gap-2">
              <input type="radio" name="recipientType" checked={recipientType === "bulk"} onChange={() => setRecipientType("bulk")} />
              Bulk Send
            </Label>
          </div>

          {recipientType === "single" ? (
            <div className="space-y-1">
              <Label>Recipient Email *</Label>
              <Input type="email" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="candidate@example.com" />
            </div>
          ) : (
            <div className="space-y-1">
              <Label>Select Candidates ({selectedCandidates.length} selected)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {candidates.map((c: any) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.some((s: any) => s.id === c.id)}
                      onChange={() => {
                        setSelectedCandidates(prev =>
                          prev.some(s => s.id === c.id) ? prev.filter(s => s.id !== c.id) : [...prev, c]
                        )
                      }}
                    />
                    {c.name} ({c.email})
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label>Template</Label>
            <select
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white"
              onChange={e => selectTemplate(e.target.value)}
              value=""
            >
              <option value="">Select a template...</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Subject *</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject" />
          </div>

          <div className="space-y-1">
            <Label>Body *</Label>
            <textarea
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm min-h-[250px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your email body here..."
            />
          </div>

          <div className="space-y-1">
            <Label>AI Email Generator</Label>
            <div className="flex gap-2 flex-wrap">
              <Button type="button" size="sm" variant="outline" onClick={() => generateWithAI("Write a professional rejection email")}>
                Rejection Email
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => generateWithAI("Write a friendly interview invitation")}>
                Interview Invite
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => generateWithAI("Write an offer letter email")}>
                Offer Letter
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => generateWithAI("Write a shortlisting notification")}>
                Shortlist Notice
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Schedule (optional)</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : scheduledAt ? "Schedule Send" : "Send Now"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { emailApi, notificationApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function EmailsPage() {
  const searchParams = useSearchParams()
  const [analytics, setAnalytics] = useState<any>(null)
  const [recentEmails, setRecentEmails] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "analytics")

  useEffect(() => {
    emailApi.analytics().then(setAnalytics).catch(() => {})
    emailApi.history().then(setRecentEmails).catch(() => {})
    emailApi.getTemplates().then(setTemplates).catch(() => {})
    notificationApi.list().then(setNotifications).catch(() => {})
  }, [])

  const seedTemplates = async () => {
    const t = await emailApi.seedTemplates()
    setTemplates(t)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Email Management</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/emails/compose">
            <Button>Compose Email</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {["analytics", "history", "templates", "notifications"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "analytics" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{analytics?.total || 0}</p><p className="text-sm text-gray-500">Total Sent</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{analytics?.deliveryRate || "0"}%</p><p className="text-sm text-gray-500">Delivery Rate</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{analytics?.openRate || "0"}%</p><p className="text-sm text-gray-500">Open Rate</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{analytics?.failed || 0}</p><p className="text-sm text-gray-500">Failed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{analytics?.scheduled || 0}</p><p className="text-sm text-gray-500">Scheduled</p></CardContent></Card>
        </div>
      )}

      {activeTab === "history" && (
        <Card>
          <CardContent className="p-4">
            {recentEmails.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No emails sent yet</p>
            ) : (
              <div className="space-y-2">
                {recentEmails.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{e.subject}</p>
                      <p className="text-gray-500">To: {e.recipient} {e.candidate?.name ? `(${e.candidate.name})` : ""}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>{new Date(e.createdAt).toLocaleDateString()}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full ${
                        e.status === "SENT" ? "bg-green-100 text-green-700" :
                        e.status === "FAILED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{e.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "templates" && (
        <div className="space-y-4">
          {templates.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <p className="text-gray-500">No email templates yet</p>
                <Button onClick={seedTemplates} variant="outline">Load Default Templates</Button>
              </CardContent>
            </Card>
          )}
          <div className="grid gap-4">
            {templates.map((t: any) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{t.name}</h3>
                      <p className="text-sm text-gray-500">{t.subject}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">Category: {t.category}</p>
                    </div>
                    <Link href={`/dashboard/emails/compose?template=${t.id}`}>
                      <Button size="sm" variant="outline">Use</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-end mb-2">
              <Button size="sm" variant="outline" onClick={async () => { await notificationApi.markAllRead(); setNotifications(prev => prev.map(n => ({...n, read: true}))) }}>
                Mark All Read
              </Button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n: any) => (
                  <div key={n.id} className={`p-3 border rounded-lg text-sm ${!n.read ? "bg-blue-50 border-blue-200" : ""}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-gray-600">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      {!n.read && (
                        <Button size="sm" variant="ghost" onClick={async () => { await notificationApi.markRead(n.id); setNotifications(prev => prev.map(x => x.id === n.id ? {...x, read: true} : x)) }}>
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

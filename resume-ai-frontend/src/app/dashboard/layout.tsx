"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notificationApi } from "@/lib/api"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (user) {
      notificationApi.unreadCount().then(r => setNotifCount(r.count)).catch(() => {})
      const interval = setInterval(() => {
        notificationApi.unreadCount().then(r => setNotifCount(r.count)).catch(() => {})
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                ResumeRank AI
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/dashboard/jobs" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Jobs
                </Link>
                <Link href="/dashboard/emails" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Emails
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/emails?tab=notifications" className="relative">
                <span className="text-lg">🔔</span>
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
              <span className="text-sm text-gray-600">{user.name || user.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
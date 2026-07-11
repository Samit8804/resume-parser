"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notificationApi } from "@/lib/api"
import { CommandPalette } from "@/components/CommandPalette"
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp"
import { useHotkeys, useSequenceHotkey } from "@/hooks/use-hotkey"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [notifCount, setNotifCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useHotkeys([
    { key: "?", shift: true, handler: () => setHelpOpen((v) => !v) },
    { key: "/", shift: true, handler: () => setHelpOpen((v) => !v) },
  ])

  const seqSteps = useCallback(
    () => [
      { key: "d", handler: () => router.push("/dashboard") },
      { key: "j", handler: () => router.push("/dashboard/jobs") },
      { key: "e", handler: () => router.push("/dashboard/emails") },
      { key: "n", handler: () => router.push("/dashboard/jobs/new") },
      { key: "c", handler: () => router.push("/dashboard/emails/compose") },
    ],
    [router],
  )

  useSequenceHotkey("g", seqSteps())

  useEffect(() => {
    if (!isLoading && !user) {
      setRedirecting(true)
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (redirecting && user) setRedirecting(false)
  }, [redirecting, user])

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
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-signal-amber border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/jobs", label: "Jobs" },
    { href: "/dashboard/emails", label: "Emails" },
  ]

  return (
    <div className="min-h-screen bg-ink">
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-pill mx-2 mt-2 max-w-7xl lg:mx-auto" : "bg-ink"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-display text-lg text-paper">
              ResumeRank AI
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-frost-900 text-paper"
                      : "text-paper/50 hover:text-paper hover:bg-frost-900/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/emails?tab=notifications" className="relative">
              <span className="text-lg">🔔</span>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-flag-coral text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-mono">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
            <span className="text-xs text-paper/30 hidden md:block font-mono">Ctrl+K</span>
            <button onClick={() => setHelpOpen(true)} className="text-xs text-paper/20 hover:text-paper/50 transition-colors font-mono hidden lg:block">?</button>
            <span className="text-sm text-paper/50 hidden sm:block">{user.name || user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-paper/50 hover:text-paper hover:bg-frost-900"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <CommandPalette />
      <KeyboardShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {children}
      </main>
    </div>
  )
}

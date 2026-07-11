"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/components/ui/toast"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider>
}

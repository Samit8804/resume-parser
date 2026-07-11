import type { Metadata } from "next"
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/components/ui/toast"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "ResumeRank AI — Explainable AI Hiring Platform", template: "%s | ResumeRank AI" },
  description: "See the reasoning. Not just the ranking. AI-powered resume parsing, scoring, and candidate matching with full explainability.",
  openGraph: {
    title: "ResumeRank AI — Explainable AI Hiring Platform",
    description: "See the reasoning. Not just the ranking. AI-powered resume parsing, scoring, and candidate matching with full explainability.",
    url: "https://resume-parser-tau-ten.vercel.app",
    siteName: "ResumeRank AI",
    type: "website",
    images: [{ url: "https://resume-parser-tau-ten.vercel.app/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeRank AI — Explainable AI Hiring Platform",
    description: "See the reasoning. Not just the ranking.",
    images: ["https://resume-parser-tau-ten.vercel.app/opengraph-image"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-ink text-paper font-sans antialiased">
        <AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider>
      </body>
    </html>
  )
}

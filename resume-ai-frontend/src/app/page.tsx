import dynamic from "next/dynamic"

const LandingShell = dynamic(() => import("@/components/LandingShell"), { ssr: false })

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ResumeRank AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Explainable AI that parses, scores, and matches resumes — then shows you exactly why.",
    url: "https://resume-parser-tau-ten.vercel.app",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }

  return (
    <div className="min-h-screen bg-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingShell />
    </div>
  )
}

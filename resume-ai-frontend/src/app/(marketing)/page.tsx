import Link from "next/link"
import GlassCard from "@/components/GlassCard"
import NavBar from "@/components/NavBar"

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavBar />

      <section className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(232,163,61,0.08) 0%, transparent 70%)",
        }} />
        <div className="relative">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-paper mb-4 leading-tight">
            See the reasoning.
          </h1>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-signal-amber mb-8 leading-tight">
            Not just the ranking.
          </h2>
          <p className="text-paper/50 text-lg max-w-xl mx-auto mb-10">
            Explainable AI that parses, scores, and matches resumes — then shows you exactly why.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="px-6 py-3 rounded-xl bg-signal-amber text-ink font-semibold hover:brightness-110 transition-all glow-amber">Start Hiring Smarter</Link>
            <a href="#how-it-works" className="px-6 py-3 rounded-xl glass text-paper/80 hover:text-paper transition-all">See How It Works</a>
          </div>

          <div className="mt-16 max-w-md mx-auto">
            <GlassCard className="text-left">
              <div className="flex items-center justify-between mb-4">
                <p className="text-5xl font-mono font-semibold text-signal-amber">94%</p>
                <span className="text-sm text-verified-teal font-mono">✔ Match</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>React</span><span className="text-verified-teal">✔ Matched</span></div>
                <div className="flex justify-between"><span>TypeScript</span><span className="text-verified-teal">✔ Matched</span></div>
                <div className="flex justify-between"><span>GraphQL</span><span className="text-flag-coral">✖ Gap</span></div>
                <div className="flex justify-between"><span>Docker</span><span className="text-verified-teal">✔ Matched</span></div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-signal-amber font-mono text-sm mb-2">FEATURES</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper">Built for how recruiters work</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "📄", title: "Parse", desc: "PDF & DOCX resume parsing with 50+ skill extraction" },
            { icon: "📊", title: "Score", desc: "Weighted scoring across skills, experience, education" },
            { icon: "🎯", title: "Match", desc: "Job description matching with confidence analysis" },
            { icon: "💡", title: "Explain", desc: "See exactly why each candidate scored what they did" },
          ].map((f) => (
            <GlassCard key={f.title} hover>
              <p className="text-2xl mb-3">{f.icon}</p>
              <h3 className="font-display text-lg text-paper mb-1">{f.title}</h3>
              <p className="text-sm text-paper/50">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-signal-amber font-mono text-sm mb-2">PIPELINE</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper">From upload to insight in four steps</h2>
        </div>
        <div className="space-y-6">
          {[
            { num: "01", title: "Upload", desc: "Drag & drop resumes or share a public application link" },
            { num: "02", title: "Parse", desc: "AI extracts name, skills, experience, projects, and more" },
            { num: "03", title: "Match", desc: "Candidate profile is scored against your job requirements" },
            { num: "04", title: "Explain", desc: "Every score includes a breakdown — no black boxes" },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-6">
              <span className="font-mono text-signal-amber text-2xl font-semibold shrink-0 w-12">{step.num}</span>
              <div className="flex-1">
                <GlassCard>
                  <h3 className="font-display text-xl text-paper mb-1">{step.title}</h3>
                  <p className="text-paper/50">{step.desc}</p>
                </GlassCard>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center">
          <p className="text-signal-amber font-mono text-sm mb-2">PRODUCT</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper mb-4">Your AI co-pilot for hiring</h2>
          <p className="text-paper/50 max-w-lg mx-auto mb-8">
            A dashboard built for speed. Create jobs, review candidates, compare side-by-side, send emails, and track your pipeline — all in one place.
          </p>
        </div>
        <GlassCard glow className="p-0 overflow-hidden">
          <div className="p-8 border-b border-frost-300/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-flag-coral" />
              <div className="w-3 h-3 rounded-full bg-signal-amber" />
              <div className="w-3 h-3 rounded-full bg-verified-teal" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[78, 92, 64, 88].map((s, i) => (
                <div key={i} className="glass rounded-lg p-3 text-center">
                  <p className="text-2xl font-mono font-semibold text-signal-amber">{s}%</p>
                  <p className="text-xs text-paper/40 mt-1">Score</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 text-center text-paper/30 text-sm">Dashboard mockup — ResumeRank AI interface</div>
        </GlassCard>
      </section>

      <section className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-signal-amber font-mono text-sm mb-2">TRUSTED</p>
          <h2 className="font-display text-3xl md:text-4xl text-paper">What recruiters say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { quote: "Cut our screening time by 70%. The AI explanations actually make sense.", name: "Sarah K.", role: "Tech Recruiter" },
            { quote: "Finally, a tool that tells me why a candidate scored what they did. No more guessing.", name: "Marcus J.", role: "Hiring Manager" },
            { quote: "The public application link alone saved us hours of manual data entry.", name: "Priya R.", role: "Talent Ops" },
          ].map((t) => (
            <GlassCard key={t.name} hover>
              <p className="text-signal-amber text-3xl mb-2">"</p>
              <p className="text-paper/70 text-sm mb-6">{t.quote}</p>
              <p className="font-medium text-paper text-sm">{t.name}</p>
              <p className="text-paper/40 text-xs">{t.role}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="pb-32 pt-8 px-4 max-w-3xl mx-auto text-center">
        <GlassCard glow className="py-16">
          <h2 className="font-display text-3xl md:text-4xl text-paper mb-4">
            See the reasoning. <span className="text-signal-amber">Not just the ranking.</span>
          </h2>
          <p className="text-paper/50 mb-8 max-w-md mx-auto">Stop guessing why candidates scored what they did. Start hiring with clarity.</p>
          <Link href="/register" className="inline-block px-8 py-4 rounded-xl bg-signal-amber text-ink font-semibold hover:brightness-110 transition-all glow-amber">Get Started Free</Link>
        </GlassCard>
      </section>

      <footer className="border-t border-frost-300/10 py-8 text-center text-paper/30 text-xs">
        ResumeRank AI — Built with explainability at its core
      </footer>
    </div>
  )
}

import { ImageResponse } from "next/og"

export const alt = "ResumeRank AI — Explainable AI Hiring Platform"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          color: "#f5f5f0",
          fontFamily: "system-ui, sans-serif",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#f5f5f0",
              marginBottom: 16,
            }}
          >
            See the reasoning.
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#e8a33d",
              marginBottom: 24,
            }}
          >
            Not just the ranking.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(245,245,240,0.5)",
              maxWidth: 600,
            }}
          >
            AI-powered resume parsing, scoring, and candidate matching.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}

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
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(232,163,61,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#f5f5f0" }}>See the reasoning.</span>
          <br />
          <span style={{ color: "#e8a33d" }}>Not just the ranking.</span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: "rgba(245,245,240,0.5)",
            maxWidth: 600,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Explainable AI that parses, scores, and matches resumes — then shows you exactly why.
        </p>
      </div>
    ),
    { ...size }
  )
}

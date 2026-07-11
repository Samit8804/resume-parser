# ResumeRank AI

> Screen and score applicants against job descriptions — then see exactly why.

![Hero screenshot](docs/screenshots/hero.png)

[![CI](https://github.com/Samit8804/resume-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/Samit8804/resume-parser/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
**Live demo → [https://resume-parser-tau-ten.vercel.app](https://resume-parser-tau-ten.vercel.app)**

---

## Features

- **Resume parsing** — Extract name, email, phone, LinkedIn, GitHub, 50+ skills, experience, education, projects, and certifications from PDF and DOCX files
- **AI scoring** — Weighted matching against job descriptions with per-category breakdowns (Skills 40%, Experience 25%, Projects 15%, Education 10%, Certifications 5%, Quality 5%)
- **Explainable results** — Every score includes skill gap analysis, strengths, weaknesses, and a plain-English verdict
- **Candidate comparison** — Side-by-side view with skill coverage matrix
- **Public job links** — Share a URL; candidates apply and get auto-parsed and scored
- **Email management** — Compose, template, schedule, and track email communication
- **Pipeline insights** — Pool statistics, missing skills heatmap, status distribution, and top candidates
- **Bulk upload** — Drag-and-drop multiple resumes at once

## Tech Stack

**Next.js 16** · TypeScript (strict) · Tailwind CSS v4 · Prisma ORM · PostgreSQL (Supabase) · Supabase Auth · Express · Zod · Nodemailer · Vercel + Render

## Quick Start

```bash
git clone https://github.com/Samit8804/resume-parser.git
cd resume-parser

# Frontend
cp resume-ai-frontend/.env.example resume-ai-frontend/.env.local
cd resume-ai-frontend && npm install && cd ..

# Backend
cp backend/.env.example backend/.env
cd backend && npm install && cd ..

# Edit the .env files with your Supabase credentials and database URL

# Run migrations
cd backend && npx prisma migrate dev && cd ..

# Start (two terminals)
cd backend && npm run dev    # http://localhost:4000
cd resume-ai-frontend && npm run dev  # http://localhost:3000
```

## Demo Credentials

| Email | Password | Role |
|---|---|---|
| `demo@test.com` | `password123` | Recruiter (read-only demo) |

## Environment Variables

### Frontend (`resume-ai-frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:4000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler URL) |
| `JWT_SECRET` | Secret for signing auth tokens |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase service_role key (for admin API) |
| `SMTP_HOST` | SMTP server hostname (optional) |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP user |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address for sent emails |

## Architecture

See [docs/architecture.md](docs/architecture.md) for data model, auth flow, and key design decisions.

## Screenshots

*Screenshots coming soon — 60-second demo video available on request.*

## License

MIT — see [LICENSE](LICENSE).

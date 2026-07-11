# Changelog

All notable changes to this project are documented here.

## [1.0.0] - 2025-07-10

### Added

- Full Next.js 16 scaffold with TypeScript, Tailwind CSS v4, and shadcn-style UI components
- Express + Prisma + PostgreSQL backend with 15 models (User, Company, Job, Candidate, Skill, Project, Certification, PipelineLog, Note, EmailTemplate, Email, Notification)
- Supabase Auth integration with email/password registration and JWT verification
- Job CRUD with skill auto-complete, slug generation, and application method selection
- Resume upload (single + bulk PDF/DOCX) with auto-parsing and AI matching
- Resume parser extracting name, email, phone, LinkedIn, GitHub, 50+ skills, experience, education, projects, certifications
- AI scoring engine with weighted sub-scores (Skill 40%, Experience 25%, Projects 15%, Education 10%, Certifications 5%, Quality 5%)
- Insights API per-job pool stats, missing skills, status distribution, top candidates
- Candidate comparison with skill coverage matrix
- Public job pages with application form and auto-AI parse on submit
- Email system: composer, 5 default templates, send/schedule, history, analytics dashboard
- Notification system with unread counts
- Dashboard pages: overview, jobs, candidates, compare, emails
- Glass + Signal design system: dark ink base, glassmorphism panels, amber/teal/coral functional colors
- Landing page with jitter headline animation and cursor-reveal score card
- CursorReveal, JitterHeadline, GlassCard interactive components

### Fixed

- Auth page visibility: replaced light-theme colors with dark glass tokens
- CORS to support comma-separated frontend origins and all Vercel preview domains
- Registration flow: backend admin API with `email_confirm: true` bypasses Supabase rate limits
- Infinite re-render loop in candidate comparison page
- Duplicate auth API calls on Supabase token refresh
- Unsafe env var handling in Supabase client
- Blank flash before redirect in dashboard layout
- Template auto-fill overwriting user edits in email composer
- `setTimeout` firing on unmounted component in job detail page
- Dead code with `Math.random()` called on every render in JitterHeadline

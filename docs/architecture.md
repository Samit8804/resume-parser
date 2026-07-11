# Architecture

## Data Model

```
User (1) ──< Job (N)          # Recruiter owns many jobs
  │              │
  │              ├──< Candidate (N)   # Job has many candidates
  │              │       │
  │              │       ├──< Skill (N)           # Parsed skills
  │              │       ├──< Project (N)         # Parsed projects
  │              │       ├──< Certification (N)   # Parsed certifications
  │              │       └──< PipelineLog (N)     # Status history
  │              │
  │              └──< EmailTemplate (N)  # Saved templates per job
  │
  ├──< Email (N)          # Sent/scheduled emails
  ├──< Notification (N)   # In-app notifications
  └──< Note (N)           # Notes on candidates
```

## Auth Flow

1. **Registration**: Frontend POSTs to `/api/auth/register` → backend creates user in Prisma (bcrypt hash, cost 12) + calls Supabase Admin API (`email_confirm: true`) to create Supabase Auth user → returns JWT.
2. **Login**: Frontend calls Supabase `signInWithPassword` → on success, fetches backend `/api/auth/me` to get user profile. Supabase session token is stored in `localStorage` and sent as `Authorization: Bearer` header.
3. **Session verification**: Backend middleware verifies JWT via Supabase Admin `auth.getUser(token)` on every protected route.
4. **Fallback**: If Supabase env vars are missing, login falls back to bcrypt comparison against the local `passwordHash` column.

## Key Decisions

- **Admin API for registration**: Supabase free tier has rate limits on signups. Using the service_role key with `email_confirm: true` bypasses this while keeping the user in Supabase Auth.
- **Dual auth state**: Both Supabase session and localStorage token are kept in sync. The auth context initializes from localStorage and subscribes to Supabase auth state changes.
- **Glass design system**: Custom Tailwind v4 theme with CSS-based configuration (no tailwind.config). Uses `@theme` directive with CSS custom properties for all design tokens.
- **CORS permissiveness**: Any `*.vercel.app` domain is allowed to support Vercel preview deployments with dynamic subdomains.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Express 4, TypeScript, Prisma ORM |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth + custom JWT fallback |
| Email | Nodemailer via SMTP (optional — logs to DB if unset) |
| Hosting | Vercel (frontend), Render (backend) |

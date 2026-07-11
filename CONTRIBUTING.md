# Contributing

## Getting Started

1. Clone the repo and copy env files:
   ```bash
   cp resume-ai-frontend/.env.example resume-ai-frontend/.env.local
   cp backend/.env.example backend/.env
   ```
2. Fill in your Supabase credentials and database URL.
3. Install dependencies:
   ```bash
   cd resume-ai-frontend && npm install
   cd ../backend && npm install
   ```
4. Run migrations:
   ```bash
   cd backend && npx prisma migrate dev
   ```
5. Start development:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   # Terminal 2
   cd resume-ai-frontend && npm run dev
   ```

## Code Style

- TypeScript strict mode — no `any`
- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- No dead code, commented-out code, or `console.log` in production

## Before Submitting a PR

- Run `npm run build` on the frontend — must pass with zero errors
- Run `npx tsc --noEmit` on the backend
- Keep PRs focused on a single concern

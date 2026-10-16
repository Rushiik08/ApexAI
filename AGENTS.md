## AGENTS.md — AI-Powered SaaS Platform

### Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`)
- **Database**: PostgreSQL on NeonDB via Prisma 6.4.1
- **Auth**: jose (JWT, HS256), bcryptjs (password hashing), HTTP-only cookies
- **AI**: OpenAI SDK (multi-provider: OpenAI, Groq, Gemini via env config)
- **Validation**: Zod 4

### Project Structure
```
src/
  app/
    api/
      ai/generate/        → POST: AI content generation (auth-gated, rate-limited)
      auth/login/         → POST: Login
      auth/logout/        → POST: Logout
      auth/register/      → POST: Register
      auth/me/            → GET: Current session user
      auth/forgot-password/ → POST: Password reset request
      auth/reset-password/  → POST: Password reset execution
      generations/        → GET (list+filter+paginate), POST (save)
      generations/[id]/   → GET, PATCH, DELETE (ownership-enforced)
      dashboard/stats/    → GET: Dashboard metrics
      user/profile/       → GET, PATCH (profile + password)
    dashboard/            → Authenticated dashboard
    workspace/            → AI generation workspace
    history/              → Saved content library
    settings/             → Profile & security settings
    login/ register/ forgot-password/ reset-password/  → Auth pages
  components/
    layout/               → Navbar, Sidebar, DashboardLayout
    ui/                   → Button, ConfirmDialog
  lib/
    ai/                   → service.ts (multi-provider), types.ts
    auth/                 → session.ts (JWT), password.ts (bcrypt)
    validations/          → auth.ts, generation.ts (Zod schemas)
    prisma.ts             → Singleton PrismaClient
    rate-limit.ts         → In-memory sliding-window rate limiter
    utils.ts              → cn(), formatDate(), truncateText()
  middleware.ts           → Edge JWT protection for routes
```

### Environment Variables Required
```env
DATABASE_URL=         # NeonDB pooled connection URL
DIRECT_URL=           # NeonDB direct connection URL (for migrations)
AUTH_SECRET=          # Min 32 char random secret for JWT signing
NEXT_PUBLIC_APP_URL=  # e.g. http://localhost:3000 or https://yourdomain.com
AI_PROVIDER=          # openai | groq | gemini
AI_API_KEY=           # API key for the chosen provider
AI_MODEL=             # e.g. gpt-4o-mini, llama-3.3-70b-versatile, gemini-2.0-flash
```

### Database Operations (after setting .env)
```bash
npx prisma migrate dev --name init   # First-time: create tables
npx prisma migrate deploy            # Production: apply migrations
npx prisma generate                  # Regenerate client after schema changes
npx prisma studio                    # Visual DB browser
```

### Local Development
```bash
cp .env.example .env   # Add your real credentials
npm install
npm run dev            # Start at http://localhost:3000
```

### Code Conventions
- All server-side secrets (AI_API_KEY, AUTH_SECRET, DATABASE_URL) are NEVER exposed to the browser
- All API routes enforce server-side session validation via `getSession()`
- All DB queries scope to `session.id` (userId) to prevent cross-user data access
- Zod schemas validate all incoming request payloads before DB operations
- Rate limiting applied: 10 reqs/min on AI generation, 15/min on login, 10/min on register
- No `any` TypeScript types in production code
- Error messages never expose internal stack traces to clients

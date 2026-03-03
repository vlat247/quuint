# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build (TypeScript compile + bundle)
npm run lint     # Run ESLint
npm start        # Start production server
```

No test framework is configured in this project.

## Architecture

**Quuint** is an AI-powered Telegram channel analysis platform. Users submit a channel name and receive structured summaries, insights, ratings, and fresh content highlights.

### Stack

- **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS v4, Radix UI, lucide-react
- **Auth + DB**: Supabase (Email/Password auth, PostgreSQL with RLS)
- **AI Backend**: External Python backend on Render (`https://quint-backend-xq3u.onrender.com`)
- **AI via frontend**: Groq SDK available but currently routes through the Python backend only

### Key Files

| Path | Purpose |
|------|---------|
| `app/actions.ts` | All server actions — core business logic |
| `app/demo/page.tsx` | Main dashboard (single page app within demo route) |
| `app/demo/layout.tsx` | Auth guard — redirects unauthenticated users to `/auth` |
| `lib/supabase/db.ts` | Database CRUD operations |
| `lib/supabase/server.ts` | Server-side Supabase client (cookie-based sessions) |
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/api.ts` | HTTP client helpers for the Python backend |
| `proxy.ts` | Middleware for automatic session refresh |

### Data Flow

1. User submits a channel name in the dashboard
2. `analyzeChannel()` server action retrieves the Supabase session token
3. Token is forwarded as a Bearer token to the Python backend (`POST /analyze`)
4. Backend validates the token, runs AI analysis, and returns structured results
5. Frontend calls `saveChannelAnalysis()` (uses admin client to bypass RLS) to persist to `summaries` table
6. Result is displayed in the UI and added to the history sidebar

### Supabase Clients

Three distinct clients exist — use the right one:
- **`lib/supabase/server.ts`**: Server Components, Route Handlers, Server Actions (cookie-based)
- **`lib/supabase/client.ts`**: Client Components only (browser auth like `signUp`, `signInWithPassword`)
- **Admin client** (created inline in `lib/supabase/db.ts` via `SUPABASE_SERVICE_ROLE_KEY`): Bypasses RLS; used only for `saveChannelAnalysis()` and user sync operations

### User Sync Pattern

After signup/login, `syncUser()` (server action) upserts a record into `public.users` (separate from `auth.users`). The `ensureUserExistsSafe()` function handles the same for OAuth callbacks. This is required because the app queries `public.users` for user metadata.

### Database Tables

- `public.users` — custom user metadata (linked to `auth.users.id` via `auth_id`)
- `folders` — user-created folders; each has `user_id` (FK → `auth.users.id`)
- `folder_channels` — join table mapping channels to folders
- `summaries` — stores full analysis JSON objects per channel per user

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # Admin client — never expose to browser
GROQ_API_KEY
TG_SESSION                       # Telegram session file reference
```

### UI Conventions

- **Fonts**: `font-sans` = Space Grotesk; branding uses UnifrakturCook (applied via `font-serif` class)
- **Mobile sidebar**: Controlled via `isMobileOpen` state; persists collapsed state in `localStorage`
- **Optimistic updates**: Folder creation and history updates are applied to local state before API confirms
- **Debounced search**: Search input waits 400ms before calling the backend `POST /search` endpoint
- **Path alias**: `@/` maps to the project root

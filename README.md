# LeadDesk Mini

A minimal lead-capture and admin desk built with Next.js 14 (App Router), Supabase, Zod, and shadcn/ui. Visitors submit a lead on the public page; the team logs in to search, review, and re-status leads on `/admin`.

## 1. Live URLs & Credentials

- **Live site:** `https://leaddesk-mini.vercel.app` _(replace with your actual Vercel deployment URL after deploying)_
- **Admin login:** `/login`
- **Test account:**
  - Email: `admin@example.com`
  - Password: `TestPassword123!`

> Create this user in your Supabase project (Authentication → Users → Add user, or via `supabase.auth.admin.createUser`) before demoing. See [Setup](#4-setup) below.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) — frontend + API routes in one repo |
| Database & Auth | Supabase (Postgres, Auth, RLS) |
| Validation | Zod + React Hook Form (`@hookform/resolvers`) |
| Styling / UI | Tailwind CSS + shadcn/ui primitives |
| Deployment | Vercel |

## 3. Architecture & Data Model

### Schema

A single `leads` table (see [`supabase/schema.sql`](./supabase/schema.sql)) holds every submission:

```
leads
├── id           uuid, primary key, default gen_random_uuid()
├── full_name    text, not null
├── email        text, not null
├── company      text, nullable
├── message      text, not null
├── status       enum('new','contacted','closed'), default 'new'
├── created_at   timestamptz, default now()
└── updated_at   timestamptz, auto-refreshed by trigger on update
```

Indexes on `created_at` (for the default sort) and `status` (for future status-based filtering) keep admin queries fast as the table grows.

### Row Level Security (RLS)

RLS is enabled on `leads` and is the actual enforcement boundary — not just the UI. Three policies:

1. **`Anyone can submit a lead`** — `insert` allowed for both `anon` and `authenticated` roles, `with check (true)`. The public form only ever needs to write, never read.
2. **`Authenticated users can view leads`** — `select` restricted to `authenticated`. An anonymous visitor (or a stolen anon key used outside the app) cannot list leads.
3. **`Authenticated users can update leads`** — `update` restricted to `authenticated`, used for status changes.

There is deliberately **no delete policy**, so leads can't be removed through the app or a leaked key — only re-statused. Because RLS is enforced at the database layer, even a request that bypasses the Next.js API routes entirely (e.g. calling Supabase directly with the anon key) is still constrained by these rules.

### API surface

- `POST /api/leads` — public. Re-validates the payload server-side with `leadSchema.parse()`-equivalent (`safeParse`) before inserting, so client-side validation is never trusted on its own.
- `PATCH /api/leads/[id]` — requires a session (checked explicitly, and backed by RLS regardless). Updates a lead's `status`.

## 4. Authentication Strategy

Auth uses **Supabase's SSR helpers** (`@supabase/ssr`) so the session lives in **HTTP-only cookies**, not `localStorage` — meaning it's readable by the server (middleware, Server Components, Route Handlers) but not by client-side JavaScript, which limits exposure to XSS.

- `middleware.ts` runs on every request to `/admin/*` and `/login`. It calls `updateSession()` (in `lib/supabase/middleware.ts`), which refreshes the Supabase session cookie on the request/response pair using the SSR client.
- If there's no session and the path is under `/admin`, the middleware redirects to `/login?redirectTo=<original-path>` **before any admin content renders or is fetched**.
- If there **is** a session and the user hits `/login`, they're redirected straight to `/admin`.
- On successful sign-in, the login page reads `redirectTo` from the query string and sends the user back where they were headed.
- Sign-out clears the session client-side (`supabase.auth.signOut()`) and the next request to `/admin` is caught by the middleware again.

This is defense in depth: middleware stops unauthenticated *rendering*, and RLS stops unauthenticated *data access* even if a request somehow reached the database layer directly.

## 5. Setup

### Prerequisites

- Node.js 18.18+
- A free [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account for deployment

### Steps

1. **Clone and install**

   ```bash
   git clone <this-repo>
   cd leaddesk-mini
   npm install
   ```

2. **Create the database schema**

   Open the Supabase SQL editor for your project and run [`supabase/schema.sql`](./supabase/schema.sql). This creates the `leads` table, the `lead_status` enum, and the RLS policies described above.

3. **Create a test admin user**

   In Supabase: **Authentication → Users → Add user**, and create `admin@example.com` / `TestPassword123!` (or your own credentials — update the README once you do).

4. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API** in Supabase.

5. **Run locally**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` for the public form and `http://localhost:3000/admin` (redirects to `/login` until you sign in).

6. **Deploy to Vercel**

   - Import the repo into Vercel.
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Project Settings → Environment Variables**.
   - Deploy, then verify `/admin` redirects to `/login` in an incognito window, and that signing in with the test account works.

## 6. Project Structure

```
app/
├── page.tsx              # Public lead intake form
├── login/page.tsx         # Admin login
├── admin/page.tsx         # Protected leads table (Server Component)
├── api/leads/route.ts     # POST — create a lead
├── api/leads/[id]/route.ts# PATCH — update lead status
└── globals.css
components/
├── lead-form.tsx          # RHF + Zod form, client-side validation
├── leads-table.tsx        # Search + ledger table
├── status-select.tsx      # Optimistic status updates
├── admin-header.tsx       # Sign-out
├── footer.tsx             # Required credit footer
└── ui/                    # shadcn/ui primitives
lib/
├── supabase/{client,server,middleware}.ts
└── validations/lead.ts    # Shared Zod schema (client + server)
middleware.ts               # Route protection for /admin
supabase/schema.sql          # Table + RLS policies
```

## 7. Design Notes

The visual language treats a lead submission like a ticket being logged at a desk: a perforated divider under the form header, a monospace "ledger" table in `/admin` with tabular numerals, and status chips instead of plain text. Palette is ink-navy on cool paper with a brass/amber accent, chosen to avoid the generic cream-and-terracotta AI-template look.

---

Built for [Digital Heroes Training Task](https://digitalheroesco.com)

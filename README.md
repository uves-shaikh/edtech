# EdTech Platform

This is a full‑stack EdTech platform built with Next.js 16.  
It lets students browse and enroll in courses, and lets creators manage their own course catalog with proper role‑based access and clean UI.

The goal of this project is to show how I structure a modern Next.js app with real authentication, Prisma/PostgreSQL, dashboards, and a small AI feature.

---

## What you can do in the app

- **Public / student side**

  - Browse all **published** courses with filters and a course detail page.
  - Sign up, sign in, and sign out with JWT auth stored in an HTTP‑only cookie.
  - Enroll in a course, see your enrollments, and manage them from a student dashboard.

- **Creator side**

  - Turn a user into a **Creator** with a linked profile.
  - Create, update, delete, and publish/unpublish courses.
  - Set price, duration, difficulty, and description.
  - See simple creator stats: how many courses you own, how many are published, and basic enrollment counts.

- **AI helper**
  - Small AI endpoint that generates marketing copy / summary for a course description using Google Gemini.

---

## Tech stack and main concepts

- **Framework**: Next.js 16 App Router (`src/app`)
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`, `prisma/migrations/`)
- **Auth**: Custom JWT auth stored in an `auth_token` HTTP‑only cookie
- **State & data fetching**: TanStack Query hooks under `src/modules/**/hooks`
- **UI**: shadcn/ui components + Tailwind CSS, theming via `next-themes`, toasts via `sonner`
- **Validation**: `zod` + `react-hook-form` for all forms
- **AI**: Google Generative AI (Gemini 1.5) for the course summary endpoint

I tried to keep everything modular: each feature lives under `src/modules/<feature>` with its own components, hooks, pages, and schemas.

---

## Project structure (high level)

- `src/app`

  - **Pages**: `/`, `/dashboard`, `/courses`, `/courses/[id]`, `/creators/[id]`, `/sign-in`, `/sign-up`
  - **API routes** under `/api`:
    - `auth`: `sign-up`, `sign-in`, `sign-out`, `me`
    - `courses`: list, create, update, delete, get by id
    - `enrollments`: list, create, delete by `courseId`
    - `creators`: get/update current creator, get creator by id
    - `stats`: role‑aware aggregates for dashboards
    - `ai/course-draft`: AI summary generation for course descriptions

- `src/modules`

  - `auth`: auth card, sign in / sign up pages, schemas, and `use-auth` hook.
  - `courses`: course form, course table, filters, AI assistant, `use-courses` and AI hooks, Zod schemas.
  - `creators`: creator profile page and `use-creators` hook.
  - `dashboard`: dashboard screen, creator and student dashboards, small stats cards.
  - `enrollments`: `use-enrollments` hook and related UI.

- `src/components`

  - `navbar`, `footer`, and app‑level providers.
  - `components/ui`: shadcn‑style primitives (`button`, `input`, `card`, `table`, `skeleton`, `dialog`, etc.).

- `src/lib`

  - `auth.ts`: sign/verify JWT, cookie helpers, user extraction.
  - `auth-guard.ts`: role checks and helper functions to protect API routes.
  - `prisma.ts`: Prisma client setup.
  - `utils.ts`: small shared helpers.

- `prisma`
  - `schema.prisma`: defines `User`, `Creator`, `Course`, `Enrollment` and role enums.
  - `migrations/`: SQL migrations.
  - `seed.ts`: seeds some users, creators, courses, and enrollments for demo/testing.

---

## Auth and roles (how it actually works)

- On **sign‑up / sign‑in**, the server creates a JWT and stores it in an `auth_token` HTTP‑only cookie.
- API routes use helpers from `src/lib/auth.ts` and `src/lib/auth-guard.ts` to:
  - Read and verify the token.
  - Load the user and role from the database.
  - Enforce access rules (for example: only creators can manage their own courses).
- Students can only access **published** courses; creators can manage their own courses, and admins have elevated access.
- Errors are returned as structured JSON with clear HTTP status codes (401/403 helpers in the guard).

---

## AI course summary endpoint

- Endpoint: `POST /api/ai/course-draft`
- Body: `{ "description": "long course description text..." }`
- Uses the `GOOGLE_GENERATIVE_AI_API_KEY` to call Gemini and returns a short, marketing‑style summary.
- This is wired into the course form UI as a helper to quickly draft course copy.

---

## Running the project locally

### 1. Prerequisites

- Node.js **20+**
- PostgreSQL database
- Package manager: npm / pnpm / yarn (examples use npm)
- (Optional) Google Generative AI API key for the AI endpoint

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create `.env.local` and set:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/edtech
JWT_SECRET=superlongrandomstring
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here   # optional, only for AI endpoint
ALLOWED_ORIGINS=http://localhost:3000                   # optional, for CORS
```

### 4. Database setup

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Run the app

```bash
npm run dev
# open http://localhost:3000
```

### 6. Useful scripts

- `npm run lint` – run ESLint on the project
- `npm run build` – production build
- `npm run start` – run the built app

---

## Notes on quality, UI and patterns

- Uses **React 19**, functional components, and hooks only.
- UI built with shadcn + Tailwind, shared primitives under `src/components/ui`.
- Data fetching goes through **TanStack Query** hooks to keep components simple and cache‑friendly.
- Forms use `react-hook-form` + `zod` schemas kept next to each feature.
- Loading states, empty states, and error handling are implemented with skeletons, toasts, and clear messages.

---

## Connect with me

If you want to talk about this project or my work in general, you can reach me here:

- **GitHub**: `https://github.com/uves-shaikh`
- **LinkedIn**: `https://www.linkedin.com/in/uves-shaikh`

Feel free to open an issue, suggest improvements, or just say hi.

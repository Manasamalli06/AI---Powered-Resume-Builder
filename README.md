# Welcome to your AI Powered Resume Builder project

## Project info

**URL**: https://lovable.dev/projects/cb811353-75d9-4752-8989-85630b9190ce

# ResumeAI — AI-Powered Resume Builder

Create professional, ATS-friendly resumes quickly using AI. This project is a Vite + React + TypeScript app that uses Supabase for auth and data storage.

## Quick overview

- Frontend: Vite + React + TypeScript
- Styling: Tailwind CSS
- Database & Auth: Supabase (hosted Postgres)
- Serverless: Supabase Functions (Edge/Serverless)

## Getting started (developer)

1. Clone the repo and install dependencies

```powershell
git clone https://github.com/Manasamalli06/AI---Powered-Resume-Builder.git
cd AI---Powered-Resume-Builder
npm install
```

2. Create a `.env` file in the project root and provide Supabase values (copy the existing `.env` as a starting point):

```properties
VITE_SUPABASE_URL="https://<your-project>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-or-publishable-key>"
VITE_SUPABASE_PROJECT_ID="<project-id>"
```

3. Start the dev server

```powershell
npm run dev
```

4. Open the app at http://localhost:5173 (default Vite port).

## Supabase

- Supabase config: `supabase/config.toml`
- Migrations: `supabase/migrations/*.sql` (these define the `profiles` and `resumes` tables and RLS policies)
- Client code: `src/integrations/supabase/client.ts`

To apply migrations locally, use the Supabase CLI or psql. This project expects a hosted Supabase instance for auth and DB.

## Environment & Security

- Do not commit service_role keys or other secrets. The frontend uses publishable keys only.
- For server-side tasks, use a service role key on a trusted server.

## Project structure (key files)

- `src/` — React + TypeScript source
- `src/integrations/supabase/` — generated types and supabase client
- `supabase/functions/` — serverless functions (e.g., generate-resume)
- `supabase/migrations/` — SQL migrations
- `public/` — static assets (favicon, images)

## Development notes

- Tailwind directives in `src/index.css` (`@tailwind`, `@apply`) require Tailwind/PostCSS support in your editor for correct linting/intellisense.
- If you see unknown at-rule warnings in your editor, install the Tailwind CSS IntelliSense extension or configure your linter to allow Tailwind at-rules.

## Contributing

Open an issue or submit a PR. Keep changes small and add tests if you modify behavior.

## Extras I can add

- `.env.example` with placeholders
- GitHub Actions workflow for CI (lint/build)
- Badges for README (build, license)

---

If you'd like, I can push an updated README to the GitHub repo and open a PR (or commit directly) — tell me which you prefer.

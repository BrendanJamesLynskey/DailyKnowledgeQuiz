# CLAUDE.md — Daily Knowledge Quiz App

## Project Overview

A full-stack Next.js application that analyses a user’s GitHub repositories, generates daily knowledge-check questions using an LLM, and delivers them via email and a web dashboard. Built to demonstrate full-stack web development, third-party API integration, and practical LLM usage.

**Repo**: https://github.com/BrendanJamesLynskey/dummy_003
**Stack**: Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL (Neon), Tailwind CSS, Resend (email), Anthropic API (question generation)

-----

## Conventions

### Code Style

- TypeScript strict mode throughout
- Functional components with hooks (no class components)
- Named exports for components, default exports for pages
- Use `async/await` over `.then()` chains
- Prefer early returns to reduce nesting
- All API route handlers in `src/app/api/`
- Environment variables in `.env.local` (never committed), documented in `.env.example`

### File Naming

- Components: `PascalCase.tsx` (e.g., `QuestionCard.tsx`)
- Utilities/libs: `camelCase.ts` (e.g., `githubClient.ts`)
- Pages: `page.tsx` inside route directories (Next.js App Router convention)

### Git

- Commit messages: imperative mood, concise (e.g., “Add question generation cron endpoint”)
- One logical change per commit
- Always `git add . && git commit -m "message"` — do not leave uncommitted work
- Do NOT push — the user will push manually

### README

- Update README.md after each major phase is complete
- Include: project description, tech stack, setup instructions, environment variables needed, architecture overview

### Dependencies

- Pin exact versions in package.json
- Prefer well-maintained, minimal dependencies
- Key deps: next, react, prisma, @prisma/client, @anthropic-ai/sdk, resend, next-auth, tailwindcss

### Testing

- Test API routes and utility functions with Vitest
- Place tests in `__tests__/` directories alongside source
- Run `npx vitest run` to verify before completing each phase

-----

## Architecture Notes

- **App Router**: All routes under `src/app/`
- **Server Actions**: Use where appropriate for form submissions
- **Prisma**: Single source of truth for DB schema; run `npx prisma db push` for development, migrations for production
- **Cron**: Daily question generation triggered via `src/app/api/cron/generate/route.ts`, secured with a CRON_SECRET header check, triggered by Vercel Cron
- **Email**: Resend SDK for transactional email; daily digest template in `src/lib/email/`
- **LLM**: Anthropic Claude API (claude-sonnet-4-20250514) for question generation; prompts in `src/lib/llm/`
- **Auth**: NextAuth.js with GitHub OAuth provider (keeps it simple and on-theme)

-----

## Build Phases

Follow the phased plan in SPEC.md. Complete each phase fully (including tests) before moving to the next. After each phase, update the README and make a commit.

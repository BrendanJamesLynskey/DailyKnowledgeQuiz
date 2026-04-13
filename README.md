# Daily Knowledge Quiz

A full-stack Next.js application that analyses a user's GitHub repositories, generates daily knowledge-check questions using an LLM, and delivers them via email and a web dashboard.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Neon
- **ORM**: Prisma
- **Auth**: NextAuth.js with GitHub OAuth
- **LLM**: Anthropic Claude API or OpenAI (configurable)
- **Email**: Resend for transactional email
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Deployment**: Vercel + Neon

## Features

- **GitHub repo analysis** — syncs your public repos and extracts languages, topics, and README context
- **AI-generated questions** — daily quiz questions tailored to your actual tech stack (Anthropic or OpenAI)
- **Answer evaluation** — submit free-text answers and get LLM-powered feedback
- **Email delivery** — daily digest email with your questions and a link to the web app
- **Streak tracking** — consecutive-day streaks for answering all questions
- **Stats dashboard** — accuracy rate, subject breakdown, and progress over time
- **History** — review past batches, scores, and individual answers

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- GitHub OAuth app credentials
- Anthropic or OpenAI API key
- Resend API key (optional, for email delivery)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/BrendanJamesLynskey/dummy_003.git
   cd dummy_003
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

4. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

5. Push the schema to your database:
   ```bash
   npx prisma db push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Run tests:
   ```bash
   npx vitest run
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth session encryption |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `LLM_PROVIDER` | `anthropic` (default) or `openai` |
| `ANTHROPIC_API_KEY` | Anthropic API key (if using Anthropic) |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI) |
| `RESEND_API_KEY` | Resend API key for email delivery |
| `CRON_SECRET` | Secret to secure the cron endpoint |

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # 404 page
│   ├── dashboard/              # Main dashboard (streak, stats, today's questions)
│   ├── questions/[batchId]/    # Daily question set view
│   ├── history/                # Past questions and responses
│   ├── settings/               # Repo selection, preferences
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth handler
│       ├── cron/generate/      # Daily question generation (Vercel Cron)
│       ├── repos/              # GET/POST repos, PATCH toggle
│       ├── questions/          # GET today's questions
│       └── responses/          # POST answer submission
├── components/
│   ├── AuthButton.tsx          # Sign in/out button
│   ├── Navbar.tsx              # Navigation bar
│   ├── QuestionCard.tsx        # Question with answer input
│   ├── QuestionBatchView.tsx   # Card navigation for question set
│   ├── RepoList.tsx            # Repo list with sync and toggle
│   ├── StreakBadge.tsx         # Streak display
│   └── StatsChart.tsx          # Subject breakdown chart
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # NextAuth config
│   ├── streak.ts               # Streak calculation and stats
│   ├── github/
│   │   ├── client.ts           # GitHub API wrapper
│   │   └── analyser.ts         # Topic extraction from repos
│   ├── llm/
│   │   ├── client.ts           # Anthropic + OpenAI wrapper
│   │   ├── prompts.ts          # Prompt templates
│   │   └── generator.ts        # Question generation orchestration
│   └── email/
│       ├── client.ts           # Resend SDK wrapper
│       └── templates.ts        # Daily digest HTML template
└── types/
    └── index.ts                # NextAuth type extensions
prisma/
└── schema.prisma               # Database schema (7 models)
```

## Data Model

- **User** — GitHub-authenticated user with preferences
- **Account/Session** — NextAuth adapter models
- **Repo** — Synced GitHub repositories with topics and README context
- **Question** — LLM-generated questions linked to repos
- **Response** — User answers with correctness evaluation
- **DailyBatch** — Daily question sets grouping questions for delivery

## Cron

Questions are generated daily at 07:00 UTC via Vercel Cron hitting `POST /api/cron/generate` (secured with `CRON_SECRET`).

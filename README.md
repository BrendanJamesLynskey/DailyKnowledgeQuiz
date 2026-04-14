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

### 1. Clone and install

```bash
git clone https://github.com/BrendanJamesLynskey/dummy_003.git
cd dummy_003
npm install
```

### 2. Create a PostgreSQL database

Sign up at [neon.tech](https://neon.tech) (free tier) and create a new project. Copy the connection string — it looks like:

```
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### 3. Create a GitHub OAuth app

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. Set **Homepage URL** to `http://localhost:3000`
3. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
4. After creating, note the **Client ID** and generate a **Client Secret**

### 4. Get an LLM API key

Choose one:

- **Anthropic** (default): Get a key at [console.anthropic.com](https://console.anthropic.com)
- **OpenAI**: Get a key at [platform.openai.com](https://platform.openai.com)

### 5. (Optional) Set up email delivery

Sign up at [resend.com](https://resend.com) and create an API key. Without this, the app still works — questions just won't be emailed.

### 6. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# Database — paste your Neon connection string
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<run: openssl rand -base64 32>

# GitHub OAuth — from step 3
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# LLM — "anthropic" (default) or "openai"
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
# or: OPENAI_API_KEY=sk-...

# Email (optional)
RESEND_API_KEY=re_...

# Cron security
CRON_SECRET=<run: openssl rand -base64 32>
```

Generate secrets with:
```bash
openssl rand -base64 32
```

### 7. Set up the database and start

```bash
npx prisma generate        # Generate the Prisma client
npx prisma db push         # Push schema to your database
npm run dev                 # Start dev server at localhost:3000
```

### 8. First use

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **Sign in with GitHub**
3. Go to **Settings** → click **Sync repos** to pull your GitHub repositories
4. Toggle repos on/off to control which ones generate questions
5. To trigger question generation locally (since Vercel Cron only runs in production):
   ```bash
   curl -X POST http://localhost:3000/api/cron/generate \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
6. Go to **Dashboard** to see and answer your questions

### 9. Run tests

```bash
npx vitest run
```

## Deploying to Vercel

1. Push this repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` to the Vercel project settings (Settings → Environment Variables). Update `NEXTAUTH_URL` to your production URL (e.g. `https://your-app.vercel.app`)
4. Update your GitHub OAuth app's **Homepage URL** and **Callback URL** to use the production domain (`https://your-app.vercel.app/api/auth/callback/github`)
5. Deploy — Vercel will automatically run `npm run build`
6. The `vercel.json` cron config will trigger question generation daily at 07:00 UTC

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon) |
| `NEXTAUTH_URL` | Yes | App URL (`http://localhost:3000` for dev) |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth app client secret |
| `LLM_PROVIDER` | No | `anthropic` (default) or `openai` |
| `ANTHROPIC_API_KEY` | If Anthropic | Anthropic API key |
| `ANTHROPIC_MODEL` | No | Model override (default: `claude-sonnet-4-20250514`) |
| `OPENAI_API_KEY` | If OpenAI | OpenAI API key |
| `OPENAI_MODEL` | No | Model override (default: `gpt-4o`) |
| `RESEND_API_KEY` | No | Resend API key for email delivery |
| `CRON_SECRET` | Yes | Secret to secure the cron endpoint |

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

For local development, trigger manually:

```bash
curl -X POST http://localhost:3000/api/cron/generate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

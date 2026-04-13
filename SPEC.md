# SPEC.md — Daily Knowledge Quiz App

## 1. Product Description

A web application that analyses a user’s public GitHub repositories to understand their technical skill areas, then generates daily knowledge-check questions tailored to those skills. Questions are delivered by email each morning and available on a web dashboard where the user can answer, review past performance, and track streaks.

**Target user**: A developer who wants daily low-effort practice across their skill areas.

-----

## 2. Tech Stack

|Layer     |Choice                       |Notes                                 |
|----------|-----------------------------|--------------------------------------|
|Framework |Next.js 14 (App Router)      |SSR + API routes in one project       |
|Language  |TypeScript (strict)          |                                      |
|Database  |PostgreSQL via Neon          |Free tier, serverless                 |
|ORM       |Prisma                       |                                      |
|Auth      |NextAuth.js (GitHub OAuth)   |GitHub login = instant access to repos|
|LLM       |Anthropic Claude API (Sonnet)|Question generation                   |
|Email     |Resend                       |Free tier covers daily sends          |
|Styling   |Tailwind CSS                 |                                      |
|Cron      |Vercel Cron                  |Triggers daily generation             |
|Testing   |Vitest                       |                                      |
|Deployment|Vercel + Neon                |                                      |

-----

## 3. Data Model (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  githubUsername  String    @unique
  image          String?
  questionsPerDay Int      @default(3)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  repos          Repo[]
  dailyBatches   DailyBatch[]
  responses      Response[]
  accounts       Account[]
  sessions       Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Repo {
  id           String   @id @default(cuid())
  userId       String
  name         String
  description  String?
  language     String?
  topics       String[] // e.g. ["python", "dsp", "fpga"]
  readmeSnippet String? // First ~500 chars of README for context
  lastSynced   DateTime @default(now())
  isActive     Boolean  @default(true) // User can exclude repos

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  questions Question[]

  @@unique([userId, name])
}

model Question {
  id           String   @id @default(cuid())
  repoId       String
  subjectArea  String   // e.g. "Python", "VHDL", "React"
  questionText String
  answerText   String
  difficulty   Int      @default(2) // 1=easy, 2=medium, 3=hard
  generatedAt  DateTime @default(now())

  repo      Repo       @relation(fields: [repoId], references: [id], onDelete: Cascade)
  responses Response[]
  batches   DailyBatch[] @relation("BatchQuestions")
}

model Response {
  id          String   @id @default(cuid())
  questionId  String
  userId      String
  userAnswer  String
  isCorrect   Boolean
  answeredAt  DateTime @default(now())

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model DailyBatch {
  id        String   @id @default(cuid())
  userId    String
  sentAt    DateTime @default(now())
  sentVia   String   @default("email") // "email" | "web"

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  questions Question[] @relation("BatchQuestions")
}
```

-----

## 4. Directory Structure

```
dummy_003/
├── CLAUDE.md
├── SPEC.md
├── README.md
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prisma/
│   └── schema.prisma
├── public/
│   └── (static assets)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Landing page (unauthenticated)
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Main dashboard (streak, stats, today's questions)
│   │   ├── questions/
│   │   │   └── [batchId]/
│   │   │       └── page.tsx        # Daily question set view
│   │   ├── history/
│   │   │   └── page.tsx            # Past questions and responses
│   │   ├── settings/
│   │   │   └── page.tsx            # Repo selection, preferences
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts    # NextAuth handler
│   │   │   ├── cron/
│   │   │   │   └── generate/
│   │   │   │       └── route.ts    # Daily question generation (Vercel Cron)
│   │   │   ├── repos/
│   │   │   │   ├── route.ts        # GET: list repos, POST: sync repos from GitHub
│   │   │   │   └── [repoId]/
│   │   │   │       └── route.ts    # PATCH: toggle repo active status
│   │   │   ├── questions/
│   │   │   │   └── route.ts        # GET: today's questions
│   │   │   └── responses/
│   │   │       └── route.ts        # POST: submit answer
│   ├── components/
│   │   ├── QuestionCard.tsx
│   │   ├── StreakBadge.tsx
│   │   ├── StatsChart.tsx
│   │   ├── RepoList.tsx
│   │   ├── Navbar.tsx
│   │   └── AuthButton.tsx
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── github/
│   │   │   ├── client.ts           # GitHub API wrapper
│   │   │   └── analyser.ts         # Extract topics/skills from repos
│   │   ├── llm/
│   │   │   ├── client.ts           # Anthropic SDK wrapper
│   │   │   ├── prompts.ts          # Question generation prompt templates
│   │   │   └── generator.ts        # Orchestrates question generation
│   │   └── email/
│   │       ├── client.ts           # Resend SDK wrapper
│   │       └── templates.ts        # Daily digest email template (React Email or HTML)
│   └── types/
│       └── index.ts                # Shared TypeScript types
├── __tests__/
│   ├── lib/
│   │   ├── github/
│   │   │   └── analyser.test.ts
│   │   └── llm/
│   │       └── generator.test.ts
│   └── api/
│       └── cron.test.ts
└── vercel.json                     # Cron configuration
```

-----

## 5. Key Features & Pages

### Landing Page (`/`)

- Hero section explaining the app
- “Sign in with GitHub” button
- If already authenticated, redirect to `/dashboard`

### Dashboard (`/dashboard`)

- Current streak (consecutive days answered)
- Today’s question batch (or “already completed” state)
- Quick stats: total questions answered, accuracy rate, subject breakdown
- Link to full history

### Question View (`/questions/[batchId]`)

- Shows questions one at a time (card-based)
- Free-text answer input
- On submit: send answer to LLM for evaluation (is this substantially correct?), store response
- Show correct answer and feedback after submission
- Progress indicator (1/3, 2/3, 3/3)

### History (`/history`)

- Paginated list of past batches with date, subject areas, score
- Expandable to see individual questions and responses
- Filter by subject area or date range

### Settings (`/settings`)

- List of synced repos with toggle to include/exclude
- “Sync repos” button to refresh from GitHub
- Questions per day slider (1–5)
- Email delivery toggle

-----

## 6. API Endpoints

### `GET /api/repos`

Returns user’s synced repos with active status.

### `POST /api/repos`

Fetches repos from GitHub API for the authenticated user, upserts into DB. Uses the user’s GitHub OAuth token from NextAuth.

### `PATCH /api/repos/[repoId]`

Toggle `isActive` for a repo.

### `GET /api/questions`

Returns today’s batch for the authenticated user. If no batch exists yet, returns empty.

### `POST /api/responses`

Body: `{ questionId, userAnswer }`
Sends the question + user answer to the LLM for evaluation, stores result.

### `POST /api/cron/generate`

Secured by `CRON_SECRET` header.
For each user:

1. Gather active repos and their topics
1. Select a weighted-random subset of subject areas
1. Call LLM to generate N questions (user’s `questionsPerDay` setting)
1. Store questions and create a DailyBatch
1. Send email digest via Resend

-----

## 7. LLM Prompt Strategy

### Question Generation Prompt

```
You are a technical quiz master. Given the following information about a developer's
GitHub repositories, generate {n} knowledge-check questions.

Repository context:
{repos_with_topics_and_readme_snippets}

Requirements:
- Each question should test practical knowledge, not trivia
- Cover different subject areas from the repos provided
- Mix difficulty levels (1 easy, 1 medium, 1 hard for a set of 3)
- Each question should be answerable in 2-3 sentences
- Provide a clear, concise model answer for each

Respond in JSON format:
[
  {
    "subjectArea": "string",
    "questionText": "string",
    "answerText": "string",
    "difficulty": 1|2|3,
    "repoName": "string"  // which repo inspired this question
  }
]
```

### Answer Evaluation Prompt

```
A developer was asked the following technical question and gave the answer below.
Evaluate whether their answer is substantially correct.

Question: {questionText}
Model answer: {answerText}
User's answer: {userAnswer}

Respond in JSON format:
{
  "isCorrect": boolean,
  "feedback": "string"  // Brief explanation of what was right/wrong
}
```

-----

## 8. Environment Variables

```env
# .env.example

# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secret-here

# GitHub OAuth (create at github.com/settings/developers)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=

# Cron security
CRON_SECRET=generate-a-secret-here
```

-----

## 9. Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/generate",
      "schedule": "0 7 * * *"
    }
  ]
}
```

Triggers daily at 07:00 UTC. The endpoint checks for `CRON_SECRET` in the Authorization header.

-----

## 10. Phased Build Plan

### Phase 1: Project Scaffold

- `npx create-next-app` with TypeScript, Tailwind, App Router
- Install all dependencies
- Set up Prisma schema, generate client
- Create `.env.example`
- Create `vercel.json`
- Verify: `npm run build` succeeds, Prisma generates without errors

### Phase 2: Auth

- Configure NextAuth with GitHub OAuth provider
- Create auth API route, auth config, Prisma adapter
- Add sign-in/sign-out to layout
- Protect dashboard/settings routes with middleware or server-side checks
- Verify: can sign in with GitHub, user record created in DB

### Phase 3: GitHub Integration

- Build GitHub API client using user’s OAuth token
- Build repo analyser (extract language, topics, README snippet)
- Create `/api/repos` endpoints
- Build Settings page with repo list and sync button
- Verify: repos appear in DB after sync, can toggle active status

### Phase 4: Question Generation

- Build Anthropic client wrapper
- Build prompt templates
- Build generator that takes repos → questions
- Create `/api/cron/generate` endpoint
- Write tests for generator (mock LLM responses)
- Verify: calling the cron endpoint creates questions and a DailyBatch

### Phase 5: Question UI

- Build QuestionCard component
- Build `/questions/[batchId]` page
- Build answer submission flow (POST to /api/responses, LLM evaluation)
- Build Dashboard page showing today’s batch and basic stats
- Verify: full flow works — see questions, submit answers, get feedback

### Phase 6: Email Delivery

- Set up Resend client
- Build email template (HTML) with questions and link to web app
- Integrate into cron endpoint (generate then send)
- Verify: email arrives with correct content

### Phase 7: History & Stats

- Build History page with past batches
- Build streak calculation logic
- Add StatsChart component (subject breakdown, accuracy over time)
- Polish Dashboard with streak badge and stats
- Verify: history displays correctly, streak counts work

### Phase 8: Polish & Deploy Prep

- Responsive design pass on all pages
- Error states and loading skeletons
- SEO metadata
- Final README update with screenshots, setup guide, architecture diagram
- Verify: `npm run build` clean, all tests pass, `.env.example` complete

```

```

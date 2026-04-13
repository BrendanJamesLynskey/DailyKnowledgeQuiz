# Daily Knowledge Quiz

A full-stack Next.js application that analyses a user's GitHub repositories, generates daily knowledge-check questions using an LLM, and delivers them via email and a web dashboard.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Neon
- **ORM**: Prisma
- **Auth**: NextAuth.js with GitHub OAuth
- **LLM**: Anthropic Claude API (Sonnet) for question generation
- **Email**: Resend for transactional email
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Deployment**: Vercel + Neon

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- GitHub OAuth app credentials
- Anthropic API key
- Resend API key

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
├── app/           # Next.js App Router pages and API routes
├── components/    # Reusable React components
├── lib/           # Shared utilities (db, auth, GitHub client, LLM, email)
└── types/         # Shared TypeScript types
prisma/
└── schema.prisma  # Database schema
```

## Build Status

- **Phase 1: Project Scaffold** - Complete
- **Phase 2: Auth** - Complete
- **Phase 3: GitHub Integration** - Complete
- **Phase 4: Question Generation** - Complete
- **Phase 5: Question UI** - Complete

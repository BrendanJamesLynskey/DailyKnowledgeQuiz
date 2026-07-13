# CLAUDE.md — Composer Studio

## Project Overview

A static Next.js application that composes new music in the style of Thomas
Tallis, William Byrd and Henry Purcell and plays it back with in-browser
instrumental synthesis. Built to demonstrate algorithmic composition, a small
music-theory engine, and practical Web Audio synthesis. Companion to the
[DSP_and_Music](https://github.com/BrendanJamesLynskey/DSP_and_Music) repo.

**Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Web Audio API, Vitest.

-----

## Conventions

### Code Style

- TypeScript strict mode throughout
- Functional components with hooks (no class components)
- Named exports for components, default exports for pages
- Use `async/await` over `.then()` chains
- Prefer early returns to reduce nesting
- Keep the music-theory and composition engines pure and framework-free so they
  stay unit-testable; browser-only code (Web Audio) lives in `lib/audio/`

### File Naming

- Components: `PascalCase.tsx` (e.g. `ComposerStudio.tsx`)
- Utilities/libs: `camelCase.ts` (e.g. `synth.ts`)
- Pages: `page.tsx` inside route directories (App Router convention)

### Git

- Commit messages: imperative mood, concise (e.g. "Add Purcell ground-bass engine")
- One logical change per commit

### Testing

- Test the theory core, PRNG and composition engines with Vitest
- Tests live in `__tests__/`
- Run `npm run test` (and `npm run build`) to verify before completing a phase

### Dependencies

- Pin exact versions for runtime deps in package.json
- Prefer minimal dependencies — the audio and composition engines are dependency-free

-----

## Architecture Notes

- **App Router**: all routes under `src/app/`; composer pages are statically
  prerendered via `generateStaticParams`.
- **No backend**: everything runs client-side or at build time — no database,
  API routes, or environment variables.
- **Composition**: `src/lib/music/` holds the theory core, seedable PRNG, and the
  three style engines; `compose.ts` is the dispatcher.
- **Audio**: `src/lib/audio/synth.ts` schedules oscillator voices with ADSR
  envelopes and a generated-impulse reverb on the Web Audio graph.
- **Determinism**: a piece is a pure function of `(composerId, seed)`. Avoid
  `Math.random`/`Date` in the engines so output stays reproducible and SSR-safe.

-----

## Build Phases

Follow the phased plan in SPEC.md. Complete each phase (including tests) before
moving on, and keep the README current as engines and UI land.

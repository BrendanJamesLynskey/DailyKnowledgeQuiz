# SPEC.md — Composer Studio

## 1. Product Description

A web application that teaches and demonstrates the compositional style of three
English composers — Thomas Tallis, William Byrd and Henry Purcell — by generating
new music in each of their styles and playing it back with in-browser synthesis.

Each composer has a page with a short history, notes on how they wrote, and an
interactive "studio" that algorithmically composes a short piece using those
techniques and plays it through the Web Audio API.

**Target user**: Anyone curious about early English music — students, teachers,
and developers interested in algorithmic composition and audio synthesis.

**Non-goals**: This is not a notation editor, a DAW, or a musicologically exact
model. It is a compact, self-contained demonstration.

-----

## 2. Tech Stack

| Layer      | Choice                    | Notes                                   |
|------------|---------------------------|-----------------------------------------|
| Framework  | Next.js 14 (App Router)   | Static export — no server needed         |
| Language   | TypeScript (strict)       |                                         |
| Styling    | Tailwind CSS              |                                         |
| Audio      | Web Audio API             | Oscillator synthesis + algorithmic reverb|
| Testing    | Vitest                    | Theory / PRNG / composition engines      |
| Deployment | Vercel                    | Purely static assets                     |

-----

## 3. Data Model

There is no database. The domain is captured in plain TypeScript types
(`src/lib/music/types.ts`):

- **Note** — `{ midi, start, duration, velocity }`, times in beats.
- **Voice** — `{ name, instrument, notes }`.
- **Composition** — `{ composerId, title, tempo, beatsPerBar, keyName, modeName, seed, voices, lengthInBeats }`.

Composer history and style data live in `src/lib/composers.ts` as a typed array.

-----

## 4. Composition Engine

Pure, framework-free, and unit-tested:

1. **Theory core** (`music/theory.ts`) — MIDI/frequency conversion, modes, scales,
   diatonic triads, scale snapping.
2. **PRNG** (`music/prng.ts`) — mulberry32 seedable RNG for reproducibility.
3. **Shared harmony** (`music/composer/harmony.ts`) — modal progression generation
   and smooth SATB voicing with musica-ficta cadences.
4. **Style engines** (`music/composer/{tallis,byrd,purcell}.ts`):
   - *Tallis* — homophonic modal SATB, slow harmonic rhythm, passing-notes, 4–3 suspension.
   - *Byrd* — the same harmony with quaver divisions in the top voice and a false relation.
   - *Purcell* — a descending chromatic ground bass with a florid, dotted, ornamented melody.
5. **Dispatcher** (`music/compose.ts`) — seed → key/mode/tempo → engine → `Composition`.

-----

## 5. Audio Engine

`lib/audio/synth.ts` schedules every note on a Web Audio graph:

- Four instrument specs (organ, choir, harpsichord, strings) as additive partials
  with per-instrument ADSR, detune and low-pass cutoff.
- A `ConvolverNode` fed a generated impulse response for a little room reverb.
- `playComposition(comp, onEnded)` returns a handle exposing `stop()`,
  `durationSec` and `elapsedBeats()` (for the piano-roll playhead).

-----

## 6. UI

- **Landing** (`/`) — three composer cards.
- **Composer** (`/composers/[id]`) — history, style notes, signature works, and the
  `ComposerStudio` client component (play/stop, tempo, "New variation", piano-roll).
- Statically prerendered via `generateStaticParams`.

-----

## 7. Build Phases

1. **Theory + PRNG core** — types, scales, seedable RNG, tests.
2. **Style engines** — Tallis, Byrd, Purcell + shared harmony, composition tests.
3. **Audio engine** — Web Audio synthesis and scheduling.
4. **UI** — landing, composer pages, studio, piano-roll.
5. **Polish** — docs, metadata, not-found, verify build/tests and in-browser playback.

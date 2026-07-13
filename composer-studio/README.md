# Composer Studio

A browser studio that composes fresh music in the style of three English
masters — **Thomas Tallis**, **William Byrd** and **Henry Purcell** — and plays
it back with in-browser instrumental synthesis. Each composer page pairs a short
history and notes on their compositional style with a live studio that generates
a new piece using those very techniques and renders it on a piano-roll.

> Companion project to [DSP_and_Music](https://github.com/BrendanJamesLynskey/DSP_and_Music).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API (oscillator synthesis + algorithmic reverb)
- **Testing**: Vitest
- **Deployment**: Vercel (fully static — no server or database required)

## Features

- **Three style engines** — a modal SATB engine for Tallis, a virginals-style
  divisions engine for Byrd, and a ground-bass lament engine for Purcell.
- **Deterministic composition** — every piece is generated from a seed via a
  small seedable PRNG, so the same seed always yields the same music.
- **In-browser playback** — notes are synthesised live with per-instrument ADSR
  envelopes (organ, choir, harpsichord, strings) and a touch of reverb. Nothing
  is pre-recorded and no audio is fetched over the network.
- **Piano-roll notation** — an SVG view of every voice with an animated
  playhead during playback.
- **Live controls** — play/stop, a tempo slider, and a "New variation" button
  that regenerates a fresh piece in the same style.
- **History & style notes** — a concise biography, bullet notes on how each
  composer wrote, and a list of signature works.

## How the composition engine works

The engine is a small, pure, framework-free music-theory core (fully unit
tested) plus one style engine per composer:

| Composer | Approach | Signature techniques modelled |
|----------|----------|-------------------------------|
| **Tallis**  | Homophonic modal SATB | Modal harmony, smooth voice-leading, musica-ficta cadences, a 4–3 suspension |
| **Byrd**    | Virginals texture | The same modal harmony with running quaver *divisions* in the top voice and an English *false relation* at the cadence |
| **Purcell** | Ground-bass lament | A descending chromatic tetrachord ground, functional harmony, dotted rhythms, appoggiaturas and a raised leading note |

The pipeline is:

```
seed ─▶ PRNG ─▶ pick key / mode / tempo ─▶ style engine ─▶ Composition ─▶ synth + piano-roll
```

- `src/lib/music/theory.ts` — pitch/MIDI/frequency conversion, modes, scales, diatonic chords.
- `src/lib/music/prng.ts` — mulberry32 seedable RNG for reproducible pieces.
- `src/lib/music/composer/` — the three style engines plus shared SATB harmony.
- `src/lib/music/compose.ts` — the dispatcher that assembles a `Composition`.
- `src/lib/audio/synth.ts` — the Web Audio synthesis and scheduling engine.

## Getting Started

### 1. Install

```bash
cd composer-studio
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pick a composer.

### 3. Test and build

```bash
npm run test     # Vitest unit tests for the theory, PRNG and composition engines
npm run build    # Next.js production build (statically prerenders every page)
```

## Project Structure

```
composer-studio/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page — the three composers
│   │   ├── composers/[id]/page.tsx  # History, style notes and the studio
│   │   ├── layout.tsx / globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ComposerCard.tsx
│   │   ├── ComposerStudio.tsx       # Client: compose + playback + controls
│   │   └── PianoRoll.tsx            # SVG notation with playhead
│   └── lib/
│       ├── composers.ts             # History / style data + engine parameters
│       ├── music/                   # Theory core + per-composer engines
│       └── audio/synth.ts           # Web Audio synthesis
└── __tests__/                       # Vitest suites
```

## Notes on authenticity

The engines are deliberately lightweight pastiches, not scholarly reconstructions
— they aim to capture the *flavour* of each composer's most recognisable devices
in a way that is audible in a few seconds of synthesised playback. Purists will
spot liberties (equal temperament, simplified voice-leading), but the modal
cadences, English false relations and descending lament basses are all there.

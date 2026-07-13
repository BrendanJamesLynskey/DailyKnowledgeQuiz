// Purcell engine: a Baroque lament built over a ground bass. A short descending
// chromatic tetrachord (tonic down to the dominant) repeats underneath, an
// inner voice supplies simple harmony, and a florid melody with dotted rhythms,
// appoggiaturas and a raised leading note at each cadence sings above it.

import { Prng } from "@/lib/music/prng";
import { scaleNotesInRange, type ModeName } from "@/lib/music/theory";
import type { Note, Voice } from "@/lib/music/types";

/** Rhythmic cells for one 2-beat ground note, as lists of durations in beats. */
const RHYTHMS: number[][] = [
  [1.5, 0.5], // dotted quarter + eighth
  [1, 1],
  [0.5, 0.5, 1],
  [2], // a held note — often a suspension
  [1, 0.5, 0.5],
  [0.5, 0.5, 0.5, 0.5],
];

export function composePurcell(
  prng: Prng,
  tonicMidi: number,
  mode: ModeName
): { voices: Voice[]; lengthInBeats: number; beatsPerBar: number } {
  const beatsPerBar = 3; // triple time, like Dido's Lament
  const groundNoteDur = 2;
  const groundLen = 6; // six chromatic steps, tonic down to the dominant
  const repeats = prng.int(3, 4);

  const bassTonic = tonicMidi - 12;
  const bass: Note[] = [];
  const inner: Note[] = [];
  const melody: Note[] = [];

  // Scale for the melody (Aeolian minor); we raise the 7th by hand at cadences.
  const scale = scaleNotesInRange(tonicMidi, mode, tonicMidi, tonicMidi + 17);
  const minorThirdPc = (((tonicMidi % 12) + 3) % 12 + 12) % 12;
  const fifthPc = (((tonicMidi % 12) + 7) % 12 + 12) % 12;
  const tonicPc = ((tonicMidi % 12) + 12) % 12;

  let melodyIdx = scale.findIndex((m) => m >= tonicMidi + 7);
  if (melodyIdx < 0) melodyIdx = Math.floor(scale.length / 2);
  let cursor = 0;

  for (let r = 0; r < repeats; r++) {
    for (let g = 0; g < groundLen; g++) {
      const groundMidi = bassTonic - g; // descending chromatic tetrachord
      bass.push({
        midi: groundMidi,
        start: cursor,
        duration: groundNoteDur,
        velocity: 0.72,
      });

      // Inner harmony: a chord tone (tonic/third/fifth) near the last one.
      const targetPc = [tonicPc, minorThirdPc, fifthPc][g % 3];
      const innerMidi = nearestPc(
        tonicMidi - 2,
        targetPc,
        tonicMidi - 5,
        tonicMidi + 6
      );
      inner.push({
        midi: innerMidi,
        start: cursor,
        duration: groundNoteDur,
        velocity: 0.45,
      });

      // Melody: choose a rhythm and walk it stepwise, mostly descending, with
      // the odd leap and an appoggiatura on strong beats.
      const isCadence = g === groundLen - 1;
      const cell = isCadence ? [1, 1] : prng.pick(RHYTHMS);
      let t = cursor;
      for (let n = 0; n < cell.length; n++) {
        const dur = cell[n];
        let midi: number;
        if (isCadence && n === cell.length - 1) {
          // Land on the tonic to close the phrase.
          midi = nearestPc(scale[melodyIdx], tonicPc, tonicMidi, tonicMidi + 12);
          melodyIdx = clampIdx(scale, scale.indexOf(midi));
        } else if (isCadence && n === 0) {
          // Raised leading note leaning into the tonic.
          midi = nearestPc(
            scale[melodyIdx],
            (tonicPc + 11) % 12,
            tonicMidi,
            tonicMidi + 12
          );
        } else {
          const leap = prng.chance(0.2) ? prng.int(2, 3) : 1;
          const dir = prng.chance(0.62) ? -1 : 1;
          melodyIdx = clampIdx(scale, melodyIdx + dir * leap);
          midi = scale[melodyIdx];
          // Appoggiatura: on a strong beat, sound the upper neighbour first.
          if (n === 0 && dur >= 1 && prng.chance(0.35)) {
            const neighbour = scale[clampIdx(scale, melodyIdx + 1)];
            melody.push({ midi: neighbour, start: t, duration: dur / 2, velocity: 0.7 });
            melody.push({ midi, start: t + dur / 2, duration: dur / 2, velocity: 0.8 });
            t += dur;
            continue;
          }
        }
        melody.push({ midi, start: t, duration: dur, velocity: n === 0 ? 0.82 : 0.7 });
        t += dur;
      }

      cursor += groundNoteDur;
    }
  }

  const voices: Voice[] = [
    { name: "Treble", instrument: "strings", notes: melody },
    { name: "Continuo", instrument: "harpsichord", notes: inner },
    { name: "Ground", instrument: "strings", notes: bass },
  ];
  return { voices, lengthInBeats: cursor, beatsPerBar };
}

function nearestPc(target: number, pc: number, low: number, high: number): number {
  let best = target;
  let bestCost = Infinity;
  for (let m = low; m <= high; m++) {
    if (((m % 12) + 12) % 12 !== pc) continue;
    const cost = Math.abs(m - target);
    if (cost < bestCost) {
      bestCost = cost;
      best = m;
    }
  }
  return best;
}

function clampIdx(scale: number[], idx: number): number {
  return Math.max(0, Math.min(scale.length - 1, idx));
}

// Shared harmonic machinery used by the Renaissance (Tallis, Byrd) engines:
// modal chord progressions voiced into four smooth SATB parts. Purcell uses a
// ground-bass approach of its own and only borrows the low-level helpers.

import { Prng } from "@/lib/music/prng";
import { degreeToMidi, type ModeName } from "@/lib/music/theory";

/** Comfortable MIDI ranges for the four choir parts. */
export const RANGES = {
  soprano: [60, 79] as [number, number],
  alto: [55, 74] as [number, number],
  tenor: [48, 67] as [number, number],
  bass: [40, 62] as [number, number],
};

/** Chord voiced as four MIDI notes. */
export interface SatbChord {
  s: number;
  a: number;
  t: number;
  b: number;
}

/** Find the note within [low, high] whose pitch class is in `pcs` and which is
 *  nearest to `target` — the core of smooth voice-leading. */
export function nearestWithPc(
  target: number,
  pcs: Set<number>,
  low: number,
  high: number
): number {
  let best = -1;
  let bestCost = Infinity;
  for (let m = low; m <= high; m++) {
    if (!pcs.has(((m % 12) + 12) % 12)) continue;
    const cost = Math.abs(m - target);
    if (cost < bestCost) {
      bestCost = cost;
      best = m;
    }
  }
  return best === -1 ? target : best;
}

/** Pitch classes (root, third, fifth) of the diatonic triad on `rootDegree`. */
export function triadPcs(
  rootDegree: number,
  tonicMidi: number,
  mode: ModeName
): [number, number, number] {
  const pc = (d: number) => degreeToMidi(d, tonicMidi, mode) % 12;
  return [pc(rootDegree), pc(rootDegree + 2), pc(rootDegree + 4)];
}

/** Voice one triad into SATB, leading each voice smoothly from the previous
 *  chord and guaranteeing the third and fifth are present (root in the bass). */
export function voiceTriad(
  pcs: [number, number, number],
  prev: SatbChord | null
): SatbChord {
  const [rootPc, thirdPc, fifthPc] = pcs;
  const all = new Set(pcs);
  const rootSet = new Set([rootPc]);

  const b = nearestWithPc(prev ? prev.b : 48, rootSet, ...RANGES.bass);
  let t = nearestWithPc(prev ? prev.t : 55, all, ...RANGES.tenor);
  let a = nearestWithPc(prev ? prev.a : 64, all, ...RANGES.alto);
  let s = nearestWithPc(prev ? prev.s : 72, all, ...RANGES.soprano);

  // Ensure the third and fifth appear among the upper voices. If one is
  // missing, retarget whichever upper voice moves the least to supply it.
  const upper: Array<{ get: () => number; set: (v: number) => void; range: [number, number] }> = [
    { get: () => t, set: (v) => (t = v), range: RANGES.tenor },
    { get: () => a, set: (v) => (a = v), range: RANGES.alto },
    { get: () => s, set: (v) => (s = v), range: RANGES.soprano },
  ];
  for (const neededPc of [thirdPc, fifthPc]) {
    const present = [t, a, s].some((m) => ((m % 12) + 12) % 12 === neededPc);
    if (present) continue;
    let bestVoice = upper[0];
    let bestCost = Infinity;
    let bestNote = -1;
    for (const v of upper) {
      const cur = v.get();
      const candidate = nearestWithPc(cur, new Set([neededPc]), ...v.range);
      const cost = Math.abs(candidate - cur);
      if (cost < bestCost) {
        bestCost = cost;
        bestVoice = v;
        bestNote = candidate;
      }
    }
    bestVoice.set(bestNote);
  }

  return { s, a, t, b };
}

/** Generate a modal chord progression as a list of root scale-degrees. The
 *  phrase always closes with a dominant (degree 4) → tonic (degree 0) cadence. */
export function generateProgression(
  prng: Prng,
  numChords: number
): number[] {
  const palette = [0, 3, 4, 5, 1, 2, 3, 5];
  const chords: number[] = [0];
  for (let i = 1; i < numChords - 2; i++) {
    let next = prng.pick(palette);
    // Avoid immediate repeats for a little more movement.
    if (next === chords[chords.length - 1]) next = prng.pick(palette);
    chords.push(next);
  }
  chords.push(4, 0); // cadence
  return chords.slice(0, numChords);
}

/** Voice a whole progression, keeping the parts connected. The dominant chord
 *  immediately before a tonic gets its third raised (musica ficta) to form a
 *  proper leading note — the hallmark of a Renaissance cadence. */
export function voiceProgression(
  progression: number[],
  tonicMidi: number,
  mode: ModeName
): SatbChord[] {
  const out: SatbChord[] = [];
  let prev: SatbChord | null = null;
  for (let i = 0; i < progression.length; i++) {
    const deg = progression[i];
    const pcs = triadPcs(deg, tonicMidi, mode);
    const isCadentialDominant =
      deg === 4 && i + 1 < progression.length && progression[i + 1] === 0;
    if (isCadentialDominant) {
      // Raise the third (the modal seventh) by a semitone for a leading note.
      pcs[1] = (pcs[1] + 1) % 12;
    }
    const chord = voiceTriad(pcs, prev);
    out.push(chord);
    prev = chord;
  }
  return out;
}

// Byrd engine: a virginals-style texture. The same modal harmony as Tallis but
// quicker, with the top voice broken into running quaver "divisions" over
// slower accompanying parts, plus a characteristic English false relation as
// the cadence approaches.

import { Prng } from "@/lib/music/prng";
import { scaleNotesInRange, type ModeName } from "@/lib/music/theory";
import type { Note, Voice } from "@/lib/music/types";
import {
  generateProgression,
  voiceProgression,
  nearestWithPc,
  RANGES,
} from "@/lib/music/composer/harmony";

/** Fill the beats between two soprano pitches with a stepwise scalar run. */
function divisions(
  from: number,
  to: number,
  steps: number,
  scale: number[]
): number[] {
  const startIdx = nearestIndex(scale, from);
  const endIdx = nearestIndex(scale, to);
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    const frac = i / steps;
    const idx = Math.round(startIdx + (endIdx - startIdx) * frac);
    out.push(scale[Math.max(0, Math.min(scale.length - 1, idx))]);
  }
  return out;
}

function nearestIndex(scale: number[], midi: number): number {
  let best = 0;
  let bestCost = Infinity;
  for (let i = 0; i < scale.length; i++) {
    const cost = Math.abs(scale[i] - midi);
    if (cost < bestCost) {
      bestCost = cost;
      best = i;
    }
  }
  return best;
}

export function composeByrd(
  prng: Prng,
  tonicMidi: number,
  mode: ModeName
): { voices: Voice[]; lengthInBeats: number; beatsPerBar: number } {
  const beatsPerBar = 4;
  const numChords = prng.int(7, 9);
  const progression = generateProgression(prng, numChords);
  const chords = voiceProgression(progression, tonicMidi, mode);
  const scale = scaleNotesInRange(tonicMidi, mode, 60, 84);

  const soprano: Note[] = [];
  const alto: Note[] = [];
  const tenor: Note[] = [];
  const bass: Note[] = [];

  let cursor = 0;
  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    const isLast = i === chords.length - 1;
    const dur = isLast ? 4 : 2;

    // Lower three voices hold the chord.
    alto.push({ midi: chord.a, start: cursor, duration: dur, velocity: 0.62 });
    tenor.push({ midi: chord.t, start: cursor, duration: dur, velocity: 0.62 });
    bass.push({ midi: chord.b, start: cursor, duration: dur, velocity: 0.7 });

    if (isLast) {
      soprano.push({ midi: chord.s, start: cursor, duration: dur, velocity: 0.8 });
    } else {
      // Break the soprano into a run of quavers toward the next chord tone.
      const next = chords[i + 1].s;
      const count = dur * 2; // quavers
      const run = divisions(chord.s, next, count, scale);
      // Occasionally rest the first quaver for rhythmic snap.
      const startBeat = prng.chance(0.3) ? 0.5 : 0;
      for (let q = 0; q < run.length; q++) {
        const t = cursor + (q * dur) / count;
        if (t < cursor + startBeat) continue;
        soprano.push({
          midi: run[q],
          start: t,
          duration: dur / count,
          velocity: q % 2 === 0 ? 0.82 : 0.68,
        });
      }
    }

    // False relation: just before the cadence, colour the alto with the
    // unraised modal seventh while the soprano run drives to the raised leading
    // note — the two forms of the seventh clashing is a signature English sound.
    if (i === chords.length - 2) {
      const naturalSeventhPc = (((tonicMidi % 12) + 10) % 12 + 12) % 12;
      const clash = nearestWithPc(
        chord.a,
        new Set([naturalSeventhPc]),
        ...RANGES.alto
      );
      alto[alto.length - 1].duration = dur - 0.5;
      alto.push({
        midi: clash,
        start: cursor + dur - 0.5,
        duration: 0.5,
        velocity: 0.5,
      });
    }

    cursor += dur;
  }

  const voices: Voice[] = [
    { name: "Divisions", instrument: "harpsichord", notes: soprano },
    { name: "Alto", instrument: "organ", notes: alto },
    { name: "Tenor", instrument: "organ", notes: tenor },
    { name: "Bass", instrument: "organ", notes: bass },
  ];
  return { voices, lengthInBeats: cursor, beatsPerBar };
}

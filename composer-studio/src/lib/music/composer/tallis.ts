// Tallis engine: serene modal SATB polyphony. Mostly homophonic block chords
// with a slow harmonic rhythm, gentle soprano passing-notes, and a 4–3
// suspension at the final cadence.

import { Prng } from "@/lib/music/prng";
import { snapToScale, type ModeName } from "@/lib/music/theory";
import type { Note, Voice } from "@/lib/music/types";
import {
  generateProgression,
  voiceProgression,
  type SatbChord,
} from "@/lib/music/composer/harmony";

export function composeTallis(
  prng: Prng,
  tonicMidi: number,
  mode: ModeName
): { voices: Voice[]; lengthInBeats: number; beatsPerBar: number } {
  const beatsPerBar = 4;
  const numChords = prng.int(7, 9);
  const progression = generateProgression(prng, numChords);
  const chords = voiceProgression(progression, tonicMidi, mode);

  const soprano: Note[] = [];
  const alto: Note[] = [];
  const tenor: Note[] = [];
  const bass: Note[] = [];
  const lines: [Note[], keyof SatbChord][] = [
    [soprano, "s"],
    [alto, "a"],
    [tenor, "t"],
    [bass, "b"],
  ];

  let cursor = 0;
  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    const isLast = i === chords.length - 1;
    const isPenult = i === chords.length - 2;
    // Slow harmonic rhythm: each chord lasts 3 beats, the final one longer.
    const dur = isLast ? 6 : 3;

    for (const [line, key] of lines) {
      line.push({ midi: chord[key], start: cursor, duration: dur, velocity: 0.75 });
    }

    // A soprano passing-note gently fills the gap to the next chord.
    if (!isLast && !isPenult && prng.chance(0.5)) {
      const cur = chord.s;
      const nxt = chords[i + 1].s;
      if (Math.abs(nxt - cur) === 2) {
        const passing = snapToScale((cur + nxt) / 2, tonicMidi, mode);
        // Shorten the sustained soprano note and add the passing tone after it.
        soprano[soprano.length - 1].duration = dur - 1;
        soprano.push({ midi: passing, start: cursor + dur - 1, duration: 1, velocity: 0.6 });
      }
    }

    // 4–3 suspension: the alto hangs a step above its cadence note, then falls.
    if (isPenult) {
      const target = chord.a;
      alto[alto.length - 1].duration = dur - 1;
      alto[alto.length - 1].midi = snapToScale(target + 2, tonicMidi, mode);
      alto.push({ midi: target, start: cursor + dur - 1, duration: 1, velocity: 0.7 });
    }

    cursor += dur;
  }

  const voices: Voice[] = [
    { name: "Soprano", instrument: "choir", notes: soprano },
    { name: "Alto", instrument: "choir", notes: alto },
    { name: "Tenor", instrument: "choir", notes: tenor },
    { name: "Bass", instrument: "choir", notes: bass },
  ];
  return { voices, lengthInBeats: cursor, beatsPerBar };
}

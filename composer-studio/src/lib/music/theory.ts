// Music-theory primitives: pitch names, modes/scales, diatonic chords and
// frequency conversion. Everything here is pure and framework-free so it can be
// unit-tested and reused by every composer engine.

export const PITCH_CLASSES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

/** Semitone offset of each natural note name within an octave. */
const NATURAL_OFFSET: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/** Interval patterns (semitones from the tonic) for the modes and scales used
 *  by the three composers. Renaissance writers thought modally; Purcell thought
 *  in major/minor, which are just the Ionian and Aeolian modes. */
export const MODES = {
  Ionian: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
} as const;

export type ModeName = keyof typeof MODES;

/** Convert a pitch-class name (e.g. "D") plus an octave to a MIDI number.
 *  Octave 4 places middle C at MIDI 60, the usual convention. */
export function pitchToMidi(name: string, octave: number): number {
  const base = NATURAL_OFFSET[name[0].toUpperCase()];
  if (base === undefined) throw new Error(`Unknown pitch name: ${name}`);
  let semitone = base;
  for (let i = 1; i < name.length; i++) {
    if (name[i] === "#") semitone += 1;
    else if (name[i] === "b") semitone -= 1;
  }
  return (octave + 1) * 12 + semitone;
}

/** Equal-tempered frequency in Hz for a MIDI note (A4 = 440 Hz). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Human-readable name for a MIDI note, e.g. 60 -> "C4". */
export function midiToName(midi: number): string {
  const pc = PITCH_CLASSES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pc}${octave}`;
}

/** Build the MIDI pitch classes (0..11 offsets) of a mode rooted on `tonic`. */
export function scalePitchClasses(tonicMidi: number, mode: ModeName): number[] {
  return MODES[mode].map((interval) => (tonicMidi + interval) % 12);
}

/** Return the scale degree (0-indexed) of a MIDI note within a mode, or -1 if
 *  the note is chromatic (not in the scale). */
export function degreeOf(
  midi: number,
  tonicMidi: number,
  mode: ModeName
): number {
  const pc = ((midi - tonicMidi) % 12 + 12) % 12;
  return (MODES[mode] as readonly number[]).indexOf(pc);
}

/** Produce every scale note between `low` and `high` MIDI inclusive. */
export function scaleNotesInRange(
  tonicMidi: number,
  mode: ModeName,
  low: number,
  high: number
): number[] {
  const pcs = new Set(scalePitchClasses(tonicMidi, mode));
  const out: number[] = [];
  for (let m = low; m <= high; m++) {
    if (pcs.has(((m % 12) + 12) % 12)) out.push(m);
  }
  return out;
}

/** The MIDI note for a given scale degree in a specific octave region. Degrees
 *  wrap and shift octave, so degree 7 is the tonic an octave up. */
export function degreeToMidi(
  degree: number,
  tonicMidi: number,
  mode: ModeName
): number {
  const steps = MODES[mode];
  const len = steps.length;
  const octaveShift = Math.floor(degree / len);
  const idx = ((degree % len) + len) % len;
  return tonicMidi + steps[idx] + 12 * octaveShift;
}

/** Build a triad (root, third, fifth) as scale degrees stacked in thirds on a
 *  given root degree. Returns the three degrees. */
export function triadDegrees(rootDegree: number): [number, number, number] {
  return [rootDegree, rootDegree + 2, rootDegree + 4];
}

/** Snap an arbitrary MIDI note to the nearest note of the scale. */
export function snapToScale(
  midi: number,
  tonicMidi: number,
  mode: ModeName
): number {
  const pcs = scalePitchClasses(tonicMidi, mode);
  for (let d = 0; d < 12; d++) {
    for (const dir of [d, -d]) {
      const pc = (((midi + dir) % 12) + 12) % 12;
      if (pcs.includes(pc)) return midi + dir;
    }
  }
  return midi;
}

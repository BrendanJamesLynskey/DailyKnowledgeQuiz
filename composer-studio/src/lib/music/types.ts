// Core musical data types shared across the composition and synthesis engines.

/** An instrument voice rendered by the Web Audio synth. */
export type InstrumentName = "organ" | "choir" | "harpsichord" | "strings";

/** A single scheduled note. Times are expressed in beats, not seconds — the
 *  synth converts beats to seconds using the composition tempo. */
export interface Note {
  /** MIDI note number. Middle C = 60. */
  midi: number;
  /** Onset in beats from the start of the piece. */
  start: number;
  /** Duration in beats. */
  duration: number;
  /** 0..1 relative loudness. */
  velocity: number;
}

/** One horizontal line of music (e.g. a soprano part or a ground bass). */
export interface Voice {
  name: string;
  instrument: InstrumentName;
  notes: Note[];
}

/** A fully realised piece ready to be visualised and played. */
export interface Composition {
  composerId: string;
  title: string;
  /** Beats per minute. */
  tempo: number;
  /** Beats per bar. */
  beatsPerBar: number;
  /** Tonic MIDI pitch class name, e.g. "D". */
  keyName: string;
  /** Mode / scale used, e.g. "Dorian". */
  modeName: string;
  seed: number;
  voices: Voice[];
  /** Total length in beats. */
  lengthInBeats: number;
}

// Top-level composition dispatcher. Given a composer id and a seed it selects a
// key/mode/tempo deterministically and hands off to the matching style engine,
// returning a fully realised Composition ready to visualise and play.

import { Prng } from "@/lib/music/prng";
import { getComposer } from "@/lib/composers";
import { pitchToMidi, type ModeName } from "@/lib/music/theory";
import { PITCH_CLASSES } from "@/lib/music/theory";
import type { Composition } from "@/lib/music/types";
import { composeTallis } from "@/lib/music/composer/tallis";
import { composeByrd } from "@/lib/music/composer/byrd";
import { composePurcell } from "@/lib/music/composer/purcell";

/** Pleasant tonic pitch classes to root a piece on (kept singable/playable). */
const TONIC_CHOICES = ["C", "D", "E", "F", "G", "A"] as const;

export function compose(composerId: string, seed: number): Composition {
  const profile = getComposer(composerId);
  if (!profile) throw new Error(`Unknown composer: ${composerId}`);

  const prng = new Prng(seed);
  const tonicName = prng.pick(TONIC_CHOICES);
  const mode = prng.pick(profile.modes) as ModeName;
  const tempo = prng.int(profile.tempo[0], profile.tempo[1]);
  // Root the tonic in a sensible central register; each engine re-registers
  // its own voices (e.g. Purcell drops the ground bass an octave).
  const tonicMidi = pitchToMidi(tonicName, 4);

  let result: {
    voices: Composition["voices"];
    lengthInBeats: number;
    beatsPerBar: number;
  };
  if (composerId === "tallis") result = composeTallis(prng, tonicMidi, mode);
  else if (composerId === "byrd") result = composeByrd(prng, tonicMidi, mode);
  else result = composePurcell(prng, tonicMidi, mode);

  const keyName = PITCH_CLASSES[((tonicMidi % 12) + 12) % 12];

  return {
    composerId,
    title: buildTitle(mode, keyName),
    tempo,
    beatsPerBar: result.beatsPerBar,
    keyName,
    modeName: mode,
    seed,
    voices: result.voices,
    lengthInBeats: result.lengthInBeats,
  };
}

const FORMS = [
  "Motet",
  "Fantasia",
  "Verse",
  "Voluntary",
  "Lament",
  "Ground",
  "Pavan",
];

function buildTitle(mode: ModeName, key: string): string {
  // A light, evocative title, chosen deterministically from the mode/key so it
  // reads sensibly without needing another RNG draw exposed to the caller.
  const form = FORMS[(key.charCodeAt(0) + mode.length) % FORMS.length];
  return `${form} in ${key} ${mode}`;
}

/** Generate a fresh, well-distributed seed from a base — handy for the UI's
 *  "new variation" button without depending on Date/Math.random at module load. */
export function nextSeed(base: number): number {
  const prng = new Prng(base ^ 0x5f3759df);
  return prng.int(1, 1_000_000);
}

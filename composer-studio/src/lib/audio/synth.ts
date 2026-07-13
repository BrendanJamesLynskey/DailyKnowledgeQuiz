// Web Audio synthesis engine. Turns a Composition into scheduled oscillator
// voices with simple ADSR envelopes and a touch of algorithmic reverb, so the
// pieces can be auditioned entirely in the browser with no samples or network.

import { midiToFreq } from "@/lib/music/theory";
import type { Composition, InstrumentName, Note } from "@/lib/music/types";

export interface PlaybackHandle {
  stop: () => void;
  durationSec: number;
  /** Beats elapsed since playback started (clamped to the piece length). */
  elapsedBeats: () => number;
}

type AnyAudioContext = typeof AudioContext;

function getAudioContextCtor(): AnyAudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: AnyAudioContext;
    webkitAudioContext?: AnyAudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** Build a short, decaying-noise impulse response for a plausible room reverb. */
function makeImpulseResponse(ctx: AudioContext, seconds: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      // Deterministic pseudo-noise (no Math.random) with exponential decay.
      const noise = Math.sin(i * 12.9898 + ch * 78.233) * 43758.5453;
      const frac = noise - Math.floor(noise);
      data[i] = (frac * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  return impulse;
}

interface InstrumentSpec {
  /** Oscillator partials as [harmonic ratio, gain, type]. */
  partials: Array<[number, number, OscillatorType]>;
  attack: number;
  release: number;
  /** If true the note sustains; otherwise it plucks (exponential decay). */
  sustain: boolean;
  /** Detune spread in cents for a small chorus. */
  detune: number;
  /** Low-pass cutoff in Hz. */
  cutoff: number;
  /** Overall level trim. */
  level: number;
}

const INSTRUMENTS: Record<InstrumentName, InstrumentSpec> = {
  organ: {
    partials: [
      [1, 0.6, "sine"],
      [2, 0.3, "sine"],
      [4, 0.15, "sine"],
    ],
    attack: 0.03,
    release: 0.18,
    sustain: true,
    detune: 4,
    cutoff: 3200,
    level: 0.5,
  },
  choir: {
    partials: [
      [1, 0.55, "sine"],
      [2, 0.22, "triangle"],
      [3, 0.12, "sine"],
    ],
    attack: 0.12,
    release: 0.32,
    sustain: true,
    detune: 8,
    cutoff: 2200,
    level: 0.5,
  },
  harpsichord: {
    partials: [
      [1, 0.6, "sawtooth"],
      [2, 0.25, "square"],
    ],
    attack: 0.004,
    release: 0.25,
    sustain: false,
    detune: 3,
    cutoff: 4200,
    level: 0.4,
  },
  strings: {
    partials: [
      [1, 0.5, "sawtooth"],
      [2, 0.2, "sawtooth"],
    ],
    attack: 0.07,
    release: 0.25,
    sustain: true,
    detune: 10,
    cutoff: 3000,
    level: 0.42,
  },
};

function scheduleNote(
  ctx: AudioContext,
  dest: AudioNode,
  instrument: InstrumentName,
  note: Note,
  startSec: number,
  durSec: number
) {
  const spec = INSTRUMENTS[instrument];
  const freq = midiToFreq(note.midi);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = spec.cutoff;

  const amp = ctx.createGain();
  const peak = spec.level * note.velocity;
  const end = startSec + durSec;

  amp.gain.setValueAtTime(0.0001, startSec);
  amp.gain.linearRampToValueAtTime(peak, startSec + spec.attack);
  if (spec.sustain) {
    amp.gain.setValueAtTime(peak, Math.max(startSec + spec.attack, end - spec.release));
    amp.gain.linearRampToValueAtTime(0.0001, end);
  } else {
    // Plucked: decay across (most of) the note's length.
    amp.gain.exponentialRampToValueAtTime(0.0001, end + 0.05);
  }

  filter.connect(amp);
  amp.connect(dest);

  const stopAt = end + spec.release + 0.05;
  const oscillators: OscillatorNode[] = [];
  for (const [ratio, gain, type] of spec.partials) {
    for (const detune of [-spec.detune, spec.detune]) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * ratio;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gain * 0.5;
      osc.connect(g);
      g.connect(filter);
      osc.start(startSec);
      osc.stop(stopAt);
      oscillators.push(osc);
    }
  }
  return oscillators;
}

export function playComposition(
  comp: Composition,
  onEnded?: () => void
): PlaybackHandle | null {
  const Ctor = getAudioContextCtor();
  if (!Ctor) return null;
  const ctx = new Ctor();

  const master = ctx.createGain();
  master.gain.value = 0.9;

  // Reverb send for a little chapel/theatre space.
  const convolver = ctx.createConvolver();
  convolver.buffer = makeImpulseResponse(ctx, comp.composerId === "tallis" ? 2.6 : 1.6);
  const wet = ctx.createGain();
  wet.gain.value = comp.composerId === "tallis" ? 0.32 : 0.2;

  master.connect(ctx.destination);
  master.connect(convolver);
  convolver.connect(wet);
  wet.connect(ctx.destination);

  const secPerBeat = 60 / comp.tempo;
  const startSec = ctx.currentTime + 0.15;

  for (const voice of comp.voices) {
    for (const note of voice.notes) {
      scheduleNote(
        ctx,
        master,
        voice.instrument,
        note,
        startSec + note.start * secPerBeat,
        Math.max(0.05, note.duration * secPerBeat * 0.98)
      );
    }
  }

  const durationSec = comp.lengthInBeats * secPerBeat;
  const endTimer = setTimeout(() => {
    onEnded?.();
    void ctx.close();
  }, (durationSec + 1) * 1000);

  return {
    durationSec,
    elapsedBeats: () =>
      Math.max(0, Math.min(comp.lengthInBeats, (ctx.currentTime - startSec) / secPerBeat)),
    stop: () => {
      clearTimeout(endTimer);
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      } catch {
        // ignore — context may already be closing
      }
      setTimeout(() => void ctx.close().catch(() => {}), 120);
    },
  };
}

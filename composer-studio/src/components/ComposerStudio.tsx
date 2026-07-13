"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { compose, nextSeed } from "@/lib/music/compose";
import { playComposition, type PlaybackHandle } from "@/lib/audio/synth";
import { PianoRoll } from "@/components/PianoRoll";

interface ComposerStudioProps {
  composerId: string;
  accent: string;
  initialSeed: number;
}

const VOICE_PALETTE = ["#6f8b9b", "#c08457", "#5b8a72", "#9b6f8f"];

export function ComposerStudio({
  composerId,
  accent,
  initialSeed,
}: ComposerStudioProps) {
  const [seed, setSeed] = useState(initialSeed);
  const [composition, setComposition] = useState(() =>
    compose(composerId, initialSeed)
  );
  const [tempo, setTempo] = useState(composition.tempo);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  const handleRef = useRef<PlaybackHandle | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopPlayback = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    handleRef.current?.stop();
    handleRef.current = null;
    setPlaying(false);
    setPlayhead(null);
  }, []);

  // Rebuild the piece whenever the seed changes, and stop any playback.
  useEffect(() => {
    stopPlayback();
    const next = compose(composerId, seed);
    setComposition(next);
    setTempo(next.tempo);
  }, [seed, composerId, stopPlayback]);

  // Clean up audio on unmount.
  useEffect(() => stopPlayback, [stopPlayback]);

  const play = useCallback(() => {
    stopPlayback();
    const handle = playComposition({ ...composition, tempo }, () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      setPlaying(false);
      setPlayhead(null);
    });
    if (!handle) {
      setUnsupported(true);
      return;
    }
    handleRef.current = handle;
    setPlaying(true);
    const tick = () => {
      if (!handleRef.current) return;
      setPlayhead(handleRef.current.elapsedBeats());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [composition, tempo, stopPlayback]);

  const regenerate = useCallback(() => {
    setSeed((s) => nextSeed(s));
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {composition.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
            {composition.keyName} {composition.modeName} · {tempo} bpm · seed{" "}
            {composition.seed}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={playing ? stopPlayback : play}
            className="rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            {playing ? "■ Stop" : "▶ Play"}
          </button>
          <button
            onClick={regenerate}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            New variation
          </button>
        </div>
      </div>

      <PianoRoll
        composition={composition}
        playhead={playhead}
        voiceColors={VOICE_PALETTE}
      />

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span className="w-14 font-mono text-xs uppercase tracking-wide text-gray-400">
            Tempo
          </span>
          <input
            type="range"
            min={40}
            max={120}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-40 accent-current"
            style={{ color: accent }}
          />
          <span className="w-16 font-mono text-xs text-gray-500">{tempo} bpm</span>
        </label>

        <div className="flex flex-wrap gap-3">
          {composition.voices.map((voice, vi) => (
            <span
              key={voice.name}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: VOICE_PALETTE[vi % VOICE_PALETTE.length] }}
              />
              {voice.name} · {voice.instrument}
            </span>
          ))}
        </div>
      </div>

      {unsupported && (
        <p className="mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          Your browser does not support the Web Audio API, so playback is
          unavailable. The notation above still reflects the generated piece.
        </p>
      )}
    </div>
  );
}

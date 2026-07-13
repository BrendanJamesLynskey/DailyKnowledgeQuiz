"use client";

import { useMemo } from "react";
import type { Composition } from "@/lib/music/types";

interface PianoRollProps {
  composition: Composition;
  /** Current playhead position in beats, or null when stopped. */
  playhead: number | null;
  /** Colours to use per voice, index-aligned with composition.voices. */
  voiceColors: string[];
}

const WIDTH = 1000;
const HEIGHT = 260;
const PAD = 8;

export function PianoRoll({ composition, playhead, voiceColors }: PianoRollProps) {
  const { minMidi, maxMidi } = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const voice of composition.voices) {
      for (const n of voice.notes) {
        lo = Math.min(lo, n.midi);
        hi = Math.max(hi, n.midi);
      }
    }
    if (!isFinite(lo)) {
      lo = 48;
      hi = 72;
    }
    return { minMidi: lo - 1, maxMidi: hi + 1 };
  }, [composition]);

  const range = Math.max(1, maxMidi - minMidi);
  const length = Math.max(1, composition.lengthInBeats);

  const x = (beat: number) => PAD + (beat / length) * (WIDTH - 2 * PAD);
  const y = (midi: number) =>
    PAD + ((maxMidi - midi) / range) * (HEIGHT - 2 * PAD);
  const rowH = (HEIGHT - 2 * PAD) / range;

  const barLines = useMemo(() => {
    const lines: number[] = [];
    for (let b = 0; b <= length; b += composition.beatsPerBar) lines.push(b);
    return lines;
  }, [length, composition.beatsPerBar]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-64 w-full"
        role="img"
        aria-label={`Piano-roll notation of ${composition.title}`}
      >
        {barLines.map((b) => (
          <line
            key={b}
            x1={x(b)}
            y1={PAD}
            x2={x(b)}
            y2={HEIGHT - PAD}
            className="stroke-gray-200 dark:stroke-gray-800"
            strokeWidth={1}
          />
        ))}

        {composition.voices.map((voice, vi) =>
          voice.notes.map((n, ni) => (
            <rect
              key={`${vi}-${ni}`}
              x={x(n.start)}
              y={y(n.midi)}
              width={Math.max(2, x(n.start + n.duration) - x(n.start) - 1)}
              height={Math.max(2, rowH - 1)}
              rx={1.5}
              fill={voiceColors[vi % voiceColors.length]}
              opacity={0.35 + 0.55 * n.velocity}
            />
          ))
        )}

        {playhead !== null && (
          <line
            x1={x(playhead)}
            y1={PAD}
            x2={x(playhead)}
            y2={HEIGHT - PAD}
            stroke="#dc2626"
            strokeWidth={2}
          />
        )}
      </svg>
    </div>
  );
}

import { describe, it, expect } from "vitest";
import { compose, nextSeed } from "@/lib/music/compose";
import { COMPOSERS } from "@/lib/composers";
import type { Composition } from "@/lib/music/types";

function allNotes(comp: Composition) {
  return comp.voices.flatMap((v) => v.notes);
}

describe("compose", () => {
  it("throws on an unknown composer", () => {
    expect(() => compose("mozart", 1)).toThrow();
  });

  it("is deterministic for a given composer and seed", () => {
    for (const c of COMPOSERS) {
      const a = compose(c.id, 4242);
      const b = compose(c.id, 4242);
      expect(a).toEqual(b);
    }
  });

  it("varies with the seed", () => {
    const a = compose("tallis", 1);
    const b = compose("tallis", 2);
    expect(JSON.stringify(a.voices)).not.toEqual(JSON.stringify(b.voices));
  });

  it("produces valid, playable notes for every composer", () => {
    for (const c of COMPOSERS) {
      const comp = compose(c.id, 777);
      const notes = allNotes(comp);
      expect(notes.length).toBeGreaterThan(0);
      expect(comp.lengthInBeats).toBeGreaterThan(0);
      for (const n of notes) {
        // Sensible MIDI range (roughly C1..C7) and positive timing.
        expect(n.midi).toBeGreaterThanOrEqual(24);
        expect(n.midi).toBeLessThanOrEqual(96);
        expect(n.start).toBeGreaterThanOrEqual(0);
        expect(n.duration).toBeGreaterThan(0);
        expect(n.start + n.duration).toBeLessThanOrEqual(comp.lengthInBeats + 0.001);
        expect(n.velocity).toBeGreaterThan(0);
        expect(n.velocity).toBeLessThanOrEqual(1);
      }
    }
  });

  it("gives each composer the expected voice layout", () => {
    expect(compose("tallis", 1).voices.map((v) => v.name)).toEqual([
      "Soprano",
      "Alto",
      "Tenor",
      "Bass",
    ]);
    expect(compose("purcell", 1).voices.map((v) => v.name)).toContain("Ground");
  });

  it("nextSeed is deterministic and in range", () => {
    expect(nextSeed(5)).toBe(nextSeed(5));
    const s = nextSeed(123);
    expect(s).toBeGreaterThanOrEqual(1);
    expect(s).toBeLessThanOrEqual(1_000_000);
  });
});

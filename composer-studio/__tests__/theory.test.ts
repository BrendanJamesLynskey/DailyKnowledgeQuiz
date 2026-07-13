import { describe, it, expect } from "vitest";
import {
  pitchToMidi,
  midiToFreq,
  midiToName,
  scalePitchClasses,
  degreeToMidi,
  scaleNotesInRange,
  snapToScale,
} from "@/lib/music/theory";

describe("pitch/midi conversions", () => {
  it("places middle C at MIDI 60", () => {
    expect(pitchToMidi("C", 4)).toBe(60);
  });

  it("handles sharps and flats", () => {
    expect(pitchToMidi("F#", 4)).toBe(66);
    expect(pitchToMidi("Bb", 4)).toBe(70);
  });

  it("computes A4 as 440 Hz", () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 5);
  });

  it("names notes from MIDI numbers", () => {
    expect(midiToName(60)).toBe("C4");
    expect(midiToName(69)).toBe("A4");
  });
});

describe("scales and modes", () => {
  it("builds the D Dorian pitch classes", () => {
    // D Dorian uses only the white notes: D E F G A B C.
    const pcs = scalePitchClasses(pitchToMidi("D", 4), "Dorian").sort(
      (a, b) => a - b
    );
    expect(pcs).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("maps scale degrees to rising MIDI notes", () => {
    const tonic = pitchToMidi("C", 4);
    expect(degreeToMidi(0, tonic, "Ionian")).toBe(60);
    expect(degreeToMidi(7, tonic, "Ionian")).toBe(72); // octave up
    expect(degreeToMidi(4, tonic, "Ionian")).toBe(67); // the fifth (G)
  });

  it("returns only in-scale notes within a range", () => {
    const tonic = pitchToMidi("C", 4);
    const notes = scaleNotesInRange(tonic, "Ionian", 60, 72);
    expect(notes).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
  });

  it("snaps a chromatic note to the nearest scale tone", () => {
    const tonic = pitchToMidi("C", 4);
    // C# is not in C major; it should snap to C or D.
    const snapped = snapToScale(61, tonic, "Ionian");
    expect([60, 62]).toContain(snapped);
  });
});

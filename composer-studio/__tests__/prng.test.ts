import { describe, it, expect } from "vitest";
import { Prng } from "@/lib/music/prng";

describe("Prng", () => {
  it("is deterministic for a given seed", () => {
    const a = new Prng(12345);
    const b = new Prng(12345);
    const seqA = Array.from({ length: 8 }, () => a.next());
    const seqB = Array.from({ length: 8 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("produces different streams for different seeds", () => {
    const a = new Prng(1);
    const b = new Prng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it("returns floats in [0, 1)", () => {
    const p = new Prng(99);
    for (let i = 0; i < 1000; i++) {
      const v = p.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("respects integer bounds inclusively", () => {
    const p = new Prng(7);
    for (let i = 0; i < 1000; i++) {
      const v = p.int(3, 6);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it("survives a zero seed without collapsing", () => {
    const p = new Prng(0);
    expect(p.next()).not.toBe(p.next());
  });
});

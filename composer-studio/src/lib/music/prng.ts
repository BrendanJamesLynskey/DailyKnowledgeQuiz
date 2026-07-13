// A small seedable pseudo-random number generator so that a given seed always
// produces the same composition. Uses the mulberry32 algorithm — fast, tiny,
// and good enough for musical variety.

export class Prng {
  private state: number;

  constructor(seed: number) {
    // Force to a 32-bit unsigned integer.
    this.state = seed >>> 0;
    // Avoid the degenerate all-zero state.
    if (this.state === 0) this.state = 0x9e3779b9;
  }

  /** Next float in [0, 1). */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Pick a random element from an array. */
  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  /** Return true with the given probability. */
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

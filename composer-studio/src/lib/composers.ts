import type { ModeName } from "@/lib/music/theory";

/** Static, human-facing information about each composer plus the musical
 *  parameters the composition engine draws on. This is the single source of
 *  truth for the history/style pages and for the algorithmic style engines. */
export interface ComposerProfile {
  id: string;
  name: string;
  lifespan: string;
  era: string;
  /** One-line hook shown on cards. */
  tagline: string;
  /** Longer historical background, a few short paragraphs. */
  history: string[];
  /** Bullet notes on how they wrote music — these directly inform the engine. */
  styleNotes: string[];
  /** Signature works, for flavour. */
  signatureWorks: string[];
  /** Default tempo range (bpm) the engine samples from. */
  tempo: [number, number];
  /** Modes the style favours. */
  modes: ModeName[];
  /** Accent colour used in the UI (Tailwind-friendly hex). */
  accent: string;
}

export const COMPOSERS: ComposerProfile[] = [
  {
    id: "tallis",
    name: "Thomas Tallis",
    lifespan: "c. 1505 – 1585",
    era: "English Renaissance (Tudor)",
    tagline: "Serene modal polyphony for the Tudor chapel.",
    history: [
      "Thomas Tallis served four English monarchs — Henry VIII, Edward VI, Mary I and Elizabeth I — steering his sacred music through the violent liturgical swings of the Reformation. Under Latin rites he wrote elaborate polyphony; under the reformed English church he adopted a plainer, syllabic style.",
      "In 1575 Elizabeth granted Tallis and his pupil William Byrd a monopoly on printed music in England, and together they published the Cantiones Sacrae. He is buried at St Alfege Church, Greenwich.",
      "His towering achievement is the forty-part motet Spem in alium, written for eight five-voice choirs — a feat of spatial polyphony unmatched in its age.",
    ],
    styleNotes: [
      "Modal harmony — Dorian and Phrygian rather than major/minor keys.",
      "Smooth, mostly stepwise voice-leading across four (SATB) voices.",
      "Imitative points of entry alternating with block homophony (as in 'If Ye Love Me').",
      "Slow harmonic rhythm: chords change roughly once per breve or semibreve.",
      "Cadences sharpen the leading note (musica ficta) and often resolve a 4–3 suspension.",
    ],
    signatureWorks: [
      "Spem in alium",
      "If Ye Love Me",
      "Lamentations of Jeremiah",
    ],
    tempo: [56, 68],
    modes: ["Dorian", "Phrygian", "Aeolian"],
    accent: "#7c6f9b",
  },
  {
    id: "byrd",
    name: "William Byrd",
    lifespan: "c. 1540 – 1623",
    era: "English Renaissance (Elizabethan/Jacobean)",
    tagline: "Restless counterpoint and English false relations.",
    history: [
      "William Byrd, probably a pupil of Tallis, became the leading English composer of his generation. A lifelong Catholic under a Protestant regime, he risked writing three Latin Masses and the Gradualia for covert recusant worship while also supplying music for the Anglican rite.",
      "He shared the 1575 royal printing monopoly with Tallis and was a Gentleman of the Chapel Royal. Beyond church music he was a founder of the English keyboard school, writing pavans, galliards and variations for the virginals collected in works such as My Ladye Nevells Booke.",
      "Byrd's fusion of continental counterpoint with a distinctly English idiom made him hugely influential on the next generation of virginalists.",
    ],
    styleNotes: [
      "More rhythmic vitality than Tallis: cross-rhythms and lively divisions.",
      "The English 'false relation' — a chromatic clash between voices at cadences.",
      "Dense imitative counterpoint where each voice enters with the same subject.",
      "Keyboard divisions: an upper voice breaks into running quavers over slower parts.",
      "Rooted in the church modes but reaching toward major/minor tonality.",
    ],
    signatureWorks: [
      "Mass for Four Voices",
      "Ave verum corpus",
      "The Bells (virginals)",
    ],
    tempo: [66, 84],
    modes: ["Dorian", "Mixolydian", "Aeolian", "Ionian"],
    accent: "#9b6f6f",
  },
  {
    id: "purcell",
    name: "Henry Purcell",
    lifespan: "1659 – 1695",
    era: "English Baroque",
    tagline: "Ground basses and aching Baroque dissonance.",
    history: [
      "Henry Purcell is often called the greatest English composer before the twentieth century. Organist of Westminster Abbey and of the Chapel Royal, he wrote sacred anthems, odes for royal occasions, incidental theatre music and the pioneering opera Dido and Aeneas.",
      "Working at the dawn of functional tonality, Purcell absorbed French dance rhythms and Italian expressive harmony while keeping a native gift for word-setting. He died at only 36 and was buried beside the Abbey organ.",
      "Dido's lament, 'When I am laid in earth', built over a descending chromatic ground bass, remains one of the most affecting arias ever written.",
    ],
    styleNotes: [
      "Functional major/minor tonality with clear dominant–tonic cadences.",
      "The ground bass: a short bass line repeated as the harmonic foundation.",
      "The lament bass — a descending (often chromatic) tetrachord from tonic to dominant.",
      "Expressive dissonance: suspensions and appoggiaturas that lean and resolve.",
      "Dotted rhythms and ornamented, speech-like melodic lines.",
    ],
    signatureWorks: [
      "Dido and Aeneas ('Dido's Lament')",
      "Music for the Funeral of Queen Mary",
      "Rejoice in the Lord alway",
    ],
    tempo: [60, 76],
    modes: ["Aeolian", "Ionian"],
    accent: "#6f8b9b",
  },
];

export function getComposer(id: string): ComposerProfile | undefined {
  return COMPOSERS.find((c) => c.id === id);
}

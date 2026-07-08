// Chord detection: given a set of active MIDI notes, return up to 3 best-fit chord names.
// Kept intentionally minimal — only the essentials for readable on-screen labels.

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

type Template = { quality: string; intervals: number[] };

// Ordered by preference when tie-breaking (earlier = more common / preferred).
const TEMPLATES: Template[] = [
  { quality: "", intervals: [0, 4, 7] }, // major
  { quality: "m", intervals: [0, 3, 7] }, // minor
  { quality: "7", intervals: [0, 4, 7, 10] },
  { quality: "maj7", intervals: [0, 4, 7, 11] },
  { quality: "m7", intervals: [0, 3, 7, 10] },
  { quality: "mMaj7", intervals: [0, 3, 7, 11] },
  { quality: "dim", intervals: [0, 3, 6] },
  { quality: "dim7", intervals: [0, 3, 6, 9] },
  { quality: "m7b5", intervals: [0, 3, 6, 10] },
  { quality: "aug", intervals: [0, 4, 8] },
  { quality: "sus2", intervals: [0, 2, 7] },
  { quality: "sus4", intervals: [0, 5, 7] },
  { quality: "6", intervals: [0, 4, 7, 9] },
  { quality: "m6", intervals: [0, 3, 7, 9] },
  { quality: "add9", intervals: [0, 2, 4, 7] },
  { quality: "madd9", intervals: [0, 2, 3, 7] },
  { quality: "9", intervals: [0, 2, 4, 7, 10] },
  { quality: "maj9", intervals: [0, 2, 4, 7, 11] },
  { quality: "m9", intervals: [0, 2, 3, 7, 10] },
  { quality: "5", intervals: [0, 7] }, // power chord
];

export type ChordCandidate = {
  /** Primary display, e.g. "F#m7" or "C/E". */
  name: string;
  /** Optional secondary label, e.g. "F#m7/A" (slash inversion) when applicable. */
  slash?: string;
  /** Numeric score; higher = better fit. */
  score: number;
};

function mod12(n: number) {
  return ((n % 12) + 12) % 12;
}

/**
 * Detect the top chord candidates that best match the given active MIDI notes.
 * Returns [] when fewer than 2 distinct pitch classes are active.
 */
export function detectChords(activeNotes: Set<number>): ChordCandidate[] {
  const notes = Array.from(activeNotes);
  if (notes.length < 2) return [];

  const pcs = new Set(notes.map(mod12));
  if (pcs.size < 2) return [];

  const bassMidi = Math.min(...notes);
  const bassPc = mod12(bassMidi);

  const candidates: ChordCandidate[] = [];

  for (let root = 0; root < 12; root++) {
    for (const tpl of TEMPLATES) {
      const chordPcs = new Set(tpl.intervals.map((iv) => mod12(root + iv)));

      // Count matches / extras / missing.
      let matched = 0;
      chordPcs.forEach((pc) => {
        if (pcs.has(pc)) matched++;
      });
      const missing = chordPcs.size - matched;
      let extras = 0;
      pcs.forEach((pc) => {
        if (!chordPcs.has(pc)) extras++;
      });

      // Require most of the chord to be present.
      if (matched < Math.max(2, chordPcs.size - 1)) continue;

      // Scoring: reward matches, penalize missing/extras. Bonus when bass = root.
      let score = matched * 10 - missing * 6 - extras * 4;
      if (chordPcs.size >= 3 && matched === chordPcs.size && extras === 0) score += 8;
      if (bassPc === root) score += 4;
      if (tpl.quality === "" || tpl.quality === "m") score += 1; // prefer plain triads on ties

      const rootName = NAMES[root];
      const isInversion = chordPcs.has(bassPc) && bassPc !== root;
      const name = isInversion
        ? `${rootName}${tpl.quality}/${NAMES[bassPc]}`
        : `${rootName}${tpl.quality}`;

      candidates.push({ name, score });
    }
  }

  if (candidates.length === 0) return [];

  // Deduplicate by name, keep highest score.
  const bestByName = new Map<string, ChordCandidate>();
  for (const c of candidates) {
    const prev = bestByName.get(c.name);
    if (!prev || c.score > prev.score) bestByName.set(c.name, c);
  }

  const sorted = Array.from(bestByName.values()).sort((a, b) => b.score - a.score);
  return sorted.slice(0, 3);
}

// 88-key piano range: MIDI 21 (A0) .. 108 (C8). Callers may restrict this range.
export const FIRST_MIDI = 21;
export const LAST_MIDI = 108;

const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const BLACK_SET = new Set([1, 3, 6, 8, 10]);

export function midiToPitchClass(n: number): string {
  return PITCH_CLASSES[((n % 12) + 12) % 12];
}

export function isBlackKey(n: number): boolean {
  return BLACK_SET.has(((n % 12) + 12) % 12);
}

export function midiToNoteName(n: number): string {
  const octave = Math.floor(n / 12) - 1;
  return `${midiToPitchClass(n)}${octave}`;
}

// Layout dimensions (in SVG user units).
export const WHITE_KEY_WIDTH = 24;
export const WHITE_KEY_HEIGHT = 150;
export const BLACK_KEY_WIDTH = 14;
export const BLACK_KEY_HEIGHT = 95;
// Vertical band reserved for note labels above the keys. Small on purpose.
export const LABEL_AREA_HEIGHT = 18;

export type PianoGeometry = {
  firstMidi: number;
  lastMidi: number;
  whiteKeyCount: number;
  keyboardWidth: number;
  totalHeight: number;
  notes: number[];
  midiToKeyX: (n: number) => number;
  midiToCenterX: (n: number) => number;
};

export function createPianoGeometry(firstMidi: number, lastMidi: number): PianoGeometry {
  const notes: number[] = [];
  for (let i = firstMidi; i <= lastMidi; i++) notes.push(i);

  // Precompute cumulative white-key index for each midi note in range.
  const whiteIdx = new Map<number, number>();
  let count = 0;
  for (const n of notes) {
    whiteIdx.set(n, count);
    if (!isBlackKey(n)) count++;
  }
  const whiteKeyCount = count;
  const keyboardWidth = whiteKeyCount * WHITE_KEY_WIDTH;

  const midiToKeyX = (n: number): number => {
    const idx = whiteIdx.get(n);
    if (idx === undefined) return 0;
    if (!isBlackKey(n)) return idx * WHITE_KEY_WIDTH;
    // Black key sits between the previous and next white key.
    // whiteIdx for a black key equals the number of white keys before it,
    // so the previous white key starts at (idx - 1) * WHITE_KEY_WIDTH.
    const prevWhiteX = (idx - 1) * WHITE_KEY_WIDTH;
    return prevWhiteX + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
  };

  const midiToCenterX = (n: number): number => {
    const w = isBlackKey(n) ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH;
    return midiToKeyX(n) + w / 2;
  };

  return {
    firstMidi,
    lastMidi,
    whiteKeyCount,
    keyboardWidth,
    totalHeight: LABEL_AREA_HEIGHT + WHITE_KEY_HEIGHT,
    notes,
    midiToKeyX,
    midiToCenterX,
  };
}

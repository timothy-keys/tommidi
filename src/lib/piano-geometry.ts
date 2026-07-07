// 88-key piano: MIDI 21 (A0) .. 108 (C8)
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

// Layout dimensions (in SVG user units).
export const WHITE_KEY_WIDTH = 24;
export const WHITE_KEY_HEIGHT = 150;
export const BLACK_KEY_WIDTH = 14;
export const BLACK_KEY_HEIGHT = 95;
export const LABEL_STRIP_HEIGHT = 44;

// Count white keys before this midi note (from FIRST_MIDI).
function whiteKeyIndex(n: number): number {
  let count = 0;
  for (let i = FIRST_MIDI; i < n; i++) {
    if (!isBlackKey(i)) count++;
  }
  return count;
}

export const WHITE_KEY_COUNT = (() => {
  let c = 0;
  for (let i = FIRST_MIDI; i <= LAST_MIDI; i++) if (!isBlackKey(i)) c++;
  return c;
})();

export const KEYBOARD_WIDTH = WHITE_KEY_COUNT * WHITE_KEY_WIDTH;

// Returns the left x of the key's rectangle.
export function midiToKeyX(n: number): number {
  if (!isBlackKey(n)) {
    return whiteKeyIndex(n) * WHITE_KEY_WIDTH;
  }
  // Black key sits between the previous white key and the next.
  const prevWhiteIdx = whiteKeyIndex(n) - 1;
  const prevWhiteX = prevWhiteIdx * WHITE_KEY_WIDTH;
  return prevWhiteX + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
}

// Center x of the key (used for labels).
export function midiToCenterX(n: number): number {
  const w = isBlackKey(n) ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH;
  return midiToKeyX(n) + w / 2;
}

export function allMidiNotes(): number[] {
  const out: number[] = [];
  for (let i = FIRST_MIDI; i <= LAST_MIDI; i++) out.push(i);
  return out;
}

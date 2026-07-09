import {
  BLACK_KEY_HEIGHT,
  BLACK_KEY_WIDTH,
  CHORD_AREA_HEIGHT,
  KEYBOARD_WIDTH,
  LABEL_STRIP_HEIGHT,
  WHITE_KEY_HEIGHT,
  WHITE_KEY_WIDTH,
  allMidiNotes,
  isBlackKey,
  midiToCenterX,
  midiToKeyX,
  midiToPitchClass,
} from "../lib/piano-geometry";
import { detectChords } from "../lib/chord-detection";

const ACCENT = "#4dd0e1";

type Props = {
  activeNotes: Set<number>;
};

export function Keyboard({ activeNotes }: Props) {
  const notes = allMidiNotes();
  const whites = notes.filter((n) => !isBlackKey(n));
  const blacks = notes.filter((n) => isBlackKey(n));
  const active = Array.from(activeNotes);
  const chords = detectChords(activeNotes);

  const totalHeight = CHORD_AREA_HEIGHT + LABEL_STRIP_HEIGHT + WHITE_KEY_HEIGHT;
  const keysY = CHORD_AREA_HEIGHT + LABEL_STRIP_HEIGHT;
  const stripY = CHORD_AREA_HEIGHT;
  const centerX = KEYBOARD_WIDTH / 2;

  return (
    <svg
      viewBox={`0 0 ${KEYBOARD_WIDTH} ${totalHeight}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax meet"
      style={{ display: "block" }}
    >
      {/* Live-only black backdrop behind chord text (stripped from exports) */}
      {chords[0] && (
        <rect
          data-live-only="true"
          x={0}
          y={0}
          width={KEYBOARD_WIDTH}
          height={CHORD_AREA_HEIGHT}
          fill="#000000"
        />
      )}

      {/* Chord names (transparent background, white text) */}
      {chords[0] && (
        <text
          x={centerX}
          y={CHORD_AREA_HEIGHT * 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fontSize={56}
        >
          {chords[0].name}
        </text>
      )}
      {(chords[1] || chords[2]) && (
        <text
          x={centerX}
          y={CHORD_AREA_HEIGHT * 0.88}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontFamily="Inter, sans-serif"
          fontWeight={500}
          fontSize={22}
          opacity={0.8}
        >
          {[chords[1]?.name, chords[2]?.name].filter(Boolean).join("   ·   ")}
        </text>
      )}

      {/* Label strip */}
      <rect x={0} y={stripY} width={KEYBOARD_WIDTH} height={LABEL_STRIP_HEIGHT} fill="#000000" />

      {/* White keys */}
      {whites.map((n) => {
        const x = midiToKeyX(n);
        const isActive = activeNotes.has(n);
        return (
          <rect
            key={`w-${n}`}
            x={x}
            y={keysY}
            width={WHITE_KEY_WIDTH}
            height={WHITE_KEY_HEIGHT}
            fill={isActive ? ACCENT : "#ffffff"}
            stroke="#000000"
            strokeWidth={1}
          />
        );
      })}

      {/* Black keys (drawn on top) */}
      {blacks.map((n) => {
        const x = midiToKeyX(n);
        const isActive = activeNotes.has(n);
        return (
          <rect
            key={`b-${n}`}
            x={x}
            y={keysY}
            width={BLACK_KEY_WIDTH}
            height={BLACK_KEY_HEIGHT}
            fill={isActive ? ACCENT : "#111111"}
            stroke="#000000"
            strokeWidth={1}
          />
        );
      })}

      {/* Note labels */}
      {active.map((n) => (
        <text
          key={`l-${n}`}
          x={midiToCenterX(n)}
          y={stripY + LABEL_STRIP_HEIGHT / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontFamily="Inter, sans-serif"
          fontWeight={600}
          fontSize={18}
        >
          {midiToPitchClass(n)}
        </text>
      ))}
    </svg>
  );
}

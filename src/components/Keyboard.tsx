import {
  BLACK_KEY_HEIGHT,
  BLACK_KEY_WIDTH,
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

const ACCENT = "#4dd0e1";

type Props = {
  activeNotes: Set<number>;
};

export function Keyboard({ activeNotes }: Props) {
  const notes = allMidiNotes();
  const whites = notes.filter((n) => !isBlackKey(n));
  const blacks = notes.filter((n) => isBlackKey(n));
  const active = Array.from(activeNotes);

  const totalHeight = LABEL_STRIP_HEIGHT + WHITE_KEY_HEIGHT;

  return (
    <svg
      viewBox={`0 0 ${KEYBOARD_WIDTH} ${totalHeight}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax meet"
      style={{ display: "block" }}
    >
      {/* Label strip */}
      <rect x={0} y={0} width={KEYBOARD_WIDTH} height={LABEL_STRIP_HEIGHT} fill="#000000" />

      {/* White keys */}
      {whites.map((n) => {
        const x = midiToKeyX(n);
        const isActive = activeNotes.has(n);
        return (
          <rect
            key={`w-${n}`}
            x={x}
            y={LABEL_STRIP_HEIGHT}
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
            y={LABEL_STRIP_HEIGHT}
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
          y={LABEL_STRIP_HEIGHT / 2}
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

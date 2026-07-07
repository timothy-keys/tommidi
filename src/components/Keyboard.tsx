import {
  BLACK_KEY_HEIGHT,
  BLACK_KEY_WIDTH,
  LABEL_AREA_HEIGHT,
  WHITE_KEY_HEIGHT,
  WHITE_KEY_WIDTH,
  isBlackKey,
  midiToPitchClass,
  type PianoGeometry,
} from "../lib/piano-geometry";
import type { Theme } from "../lib/themes";

type Props = {
  geometry: PianoGeometry;
  activeNotes: Set<number>;
  theme: Theme;
};

// Approximate width of the label text at fontSize 10 in Inter 600.
function estimateTextWidth(text: string, fontSize: number) {
  // rough: ~0.6em per char for Inter semibold, sharps add a bit.
  return text.length * fontSize * 0.62;
}

export function Keyboard({ geometry, activeNotes, theme }: Props) {
  const { notes, keyboardWidth, totalHeight, midiToKeyX, midiToCenterX } = geometry;
  const whites = notes.filter((n) => !isBlackKey(n));
  const blacks = notes.filter((n) => isBlackKey(n));
  const active = Array.from(activeNotes).filter(
    (n) => n >= geometry.firstMidi && n <= geometry.lastMidi,
  );

  const labelFontSize = 10;
  const labelPadX = 4;
  const labelHeight = 14;
  const labelGap = 2; // gap between label bottom and key top

  return (
    <svg
      viewBox={`0 0 ${keyboardWidth} ${totalHeight}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax meet"
      style={{ display: "block" }}
    >
      {/* White keys */}
      {whites.map((n) => {
        const x = midiToKeyX(n);
        const isActive = activeNotes.has(n);
        return (
          <rect
            key={`w-${n}`}
            x={x}
            y={LABEL_AREA_HEIGHT}
            width={WHITE_KEY_WIDTH}
            height={WHITE_KEY_HEIGHT}
            fill={isActive ? theme.accent : theme.whiteKey}
            stroke={theme.keyBorder}
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
            y={LABEL_AREA_HEIGHT}
            width={BLACK_KEY_WIDTH}
            height={BLACK_KEY_HEIGHT}
            fill={isActive ? theme.accent : theme.blackKey}
            stroke={theme.keyBorder}
            strokeWidth={1}
          />
        );
      })}

      {/* Per-note labels: small pill directly above each pressed key */}
      {active.map((n) => {
        const text = midiToPitchClass(n);
        const textW = estimateTextWidth(text, labelFontSize);
        const w = Math.max(textW + labelPadX * 2, 14);
        const cx = midiToCenterX(n);
        const x = cx - w / 2;
        const y = LABEL_AREA_HEIGHT - labelHeight - labelGap;
        return (
          <g key={`l-${n}`}>
            <rect
              x={x}
              y={y}
              width={w}
              height={labelHeight}
              rx={3}
              ry={3}
              fill={theme.labelBg}
            />
            <text
              x={cx}
              y={y + labelHeight / 2 + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fill={theme.labelText}
              fontFamily="Inter, sans-serif"
              fontWeight={600}
              fontSize={labelFontSize}
            >
              {text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

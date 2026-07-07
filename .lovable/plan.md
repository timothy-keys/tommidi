# MIDI Piano Visualizer

A single-page app that connects to a USB MIDI keyboard via Web MIDI, renders a full 88-key piano, shows the note name (letter only, no octave number) in a black label strip directly above each pressed key, and records the whole thing as a transparent WebM video for layering in Adobe Premiere.

## Layout

```text
┌──────────────────────────────────────────────────────────┐
│  [ ● Record ]  [ ■ Stop ]  [ ⬇ Download ]   MIDI: ●     │  ← tiny toolbar (hidden from recording)
├──────────────────────────────────────────────────────────┤
│                                                          │
│         [F#]        [A ]         [C ]                    │  ← black label strip (one continuous bar)
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐   │
│  │ │▓│ │▓│ │ │▓│ │▓│ │▓│ │ │▓│ │▓│ │ │▓│ │▓│ │▓│ │ │   │  ← 88-key piano
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘   │
└──────────────────────────────────────────────────────────┘
        (transparent background everywhere else)
```

- Page background: fully transparent (no body color) so the recording alpha channel is clean.
- One continuous **black horizontal strip** sits directly above the keys spanning the full keyboard width. Note letters appear as white text inside this strip, horizontally centered above whichever key is currently pressed. Letters are `C, C#, D, D#, E, F, F#, G, G#, A, A#, B` — no octave numbers.
- Pressed keys tint a single accent color (soft cyan, `#4dd0e1`) with a subtle fade-out on release.
- Toolbar is small, top-left, and is placed **outside** the recorded region so it never appears in exports.

## Visual style

- Font: Inter (via `@fontsource/inter`, weight 600) for the note labels — clean, readable at small sizes on YouTube.
- Colors: white keys `#ffffff`, black keys `#111111`, key border `#000000` (1px), pressed tint `#4dd0e1`, label strip `#000000`, label text `#ffffff`.
- Piano proportions: white key ratio ~1:6 (width:height), black keys ~60% height and ~60% width of a white key, standard piano layout.
- Label strip height: ~44px, sits flush above the keys with no gap.

## Behavior

- On load, request `navigator.requestMIDIAccess()`. Show a small status dot (green = connected, amber = waiting, red = unsupported/denied).
- Listen to `noteon` (velocity > 0) and `noteoff` on every input. Maintain a `Set` of active MIDI note numbers in React state.
- For each active note, render one label centered over that key's x-position inside the black strip. Multiple simultaneous notes = multiple labels side-by-side in the same strip.
- Note-name mapping: MIDI number → pitch class letter using `["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][n % 12]`.

## Recording (transparent WebM)

- Use `MediaRecorder` with `canvas.captureStream(60)` from an offscreen canvas that mirrors the piano + label strip.
- MIME: `video/webm;codecs=vp9` with `alpha: true` on the canvas context so the exported WebM keeps its alpha channel (Premiere imports VP9 alpha WebM directly).
- Render loop (`requestAnimationFrame`) draws only the piano and label strip onto the canvas — no toolbar, no page chrome — so the recording is exactly what will be composited in Premiere.
- Recording controls: Record / Stop / Download `.webm`. File name: `midi-visualizer-<timestamp>.webm`.
- Show a subtle red dot on the toolbar while recording (never drawn onto the canvas).

## Technical details

- Route: replace `src/routes/index.tsx` placeholder with the visualizer page. Update `__root.tsx` head to title "MIDI Piano Visualizer" + matching description/OG tags. Remove body background color so transparency works end-to-end.
- New files:
  - `src/components/PianoVisualizer.tsx` — orchestrator: MIDI access, active-notes state, toolbar, canvas ref.
  - `src/components/Keyboard.tsx` — SVG-based 88-key piano (A0–C8), receives `activeNotes: Set<number>`.
  - `src/components/LabelStrip.tsx` — black bar with white letter labels positioned by MIDI number → x-coordinate.
  - `src/hooks/useMidiInput.ts` — Web MIDI subscription, returns `{ activeNotes, status }`.
  - `src/lib/piano-geometry.ts` — helpers: `midiToX(n)`, `isBlackKey(n)`, `midiToPitchClass(n)`, key dimensions.
  - `src/lib/recorder.ts` — canvas mirror + `MediaRecorder` wrapper (start/stop/download, VP9 alpha).
- Install `@fontsource/inter`; import once in `src/routes/__root.tsx`.
- Browser support note surfaced in the UI: Web MIDI + VP9 alpha both require Chrome/Edge (works perfectly for the YouTube workflow).

## Out of scope (unless you ask)

- MIDI file upload / playback
- Audio recording (visual only — you'll use your real piano audio in Premiere)
- Sustain pedal visualization, velocity-based coloring, note trails

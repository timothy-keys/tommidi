import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard } from "./Keyboard";
import { useMidiInput } from "../hooks/useMidiInput";
import { SvgRecorder, downloadBlob } from "../lib/recorder";
import {
  FIRST_MIDI,
  LAST_MIDI,
  createPianoGeometry,
  midiToNoteName,
} from "../lib/piano-geometry";
import { THEMES, THEME_LIST, type ThemeId } from "../lib/themes";

const RENDER_WIDTH = 1920;

export function PianoVisualizer() {
  const { activeNotes, status } = useMidiInput();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<SvgRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId>("classic");
  const [firstMidi, setFirstMidi] = useState<number>(FIRST_MIDI);
  const [lastMidi, setLastMidi] = useState<number>(LAST_MIDI);

  const theme = THEMES[themeId];
  const geometry = useMemo(
    () => createPianoGeometry(firstMidi, lastMidi),
    [firstMidi, lastMidi],
  );

  const renderHeight = Math.round(
    (RENDER_WIDTH * geometry.totalHeight) / geometry.keyboardWidth,
  );

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
    };
  }, []);

  const startRecording = () => {
    const svg = wrapperRef.current?.querySelector("svg");
    if (!svg) return;
    try {
      const rec = new SvgRecorder(svg as SVGSVGElement, RENDER_WIDTH, renderHeight);
      rec.onStop = (blob) => {
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        downloadBlob(blob, `midi-visualizer-${ts}.webm`);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const statusColor =
    status === "connected"
      ? "#22c55e"
      : status === "waiting"
        ? "#f59e0b"
        : status === "idle"
          ? "#9ca3af"
          : "#ef4444";

  const statusLabel =
    status === "connected"
      ? "MIDI connected"
      : status === "waiting"
        ? "Waiting for MIDI device"
        : status === "unsupported"
          ? "Web MIDI unsupported (use Chrome/Edge)"
          : status === "denied"
            ? "MIDI access denied"
            : "MIDI idle";

  const noteOptions: number[] = [];
  for (let i = FIRST_MIDI; i <= LAST_MIDI; i++) noteOptions.push(i);

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      {/* Toolbar — never appears in the recording */}
      <div
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "8px 12px",
          background: "rgba(20,20,20,0.85)",
          borderRadius: 8,
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          zIndex: 10,
        }}
      >
        {!recording ? (
          <button
            onClick={startRecording}
            style={btnStyle}
            disabled={status === "unsupported"}
          >
            <span style={{ color: "#ef4444" }}>●</span> Record
          </button>
        ) : (
          <button onClick={stopRecording} style={{ ...btnStyle, background: "#ef4444" }}>
            ■ Stop &amp; Download
          </button>
        )}
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          style={btnStyle}
          aria-label="Settings"
          title="Settings"
        >
          ⚙ Settings
        </button>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginLeft: 8,
            opacity: 0.9,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: statusColor,
              display: "inline-block",
            }}
          />
          {statusLabel}
        </span>
        {recording && (
          <span style={{ marginLeft: 8, color: "#ef4444" }}>● REC</span>
        )}
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: 12,
            width: 280,
            padding: 14,
            background: "rgba(20,20,20,0.92)",
            borderRadius: 10,
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>Settings</div>

          <label style={fieldStyle}>
            <span style={labelStyle}>Theme</span>
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value as ThemeId)}
              style={selectStyle}
            >
              {THEME_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>First note</span>
            <select
              value={firstMidi}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFirstMidi(v);
                if (v > lastMidi) setLastMidi(v);
              }}
              style={selectStyle}
            >
              {noteOptions.map((n) => (
                <option key={n} value={n}>
                  {midiToNoteName(n)}
                </option>
              ))}
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>Last note</span>
            <select
              value={lastMidi}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLastMidi(v);
                if (v < firstMidi) setFirstMidi(v);
              }}
              style={selectStyle}
            >
              {noteOptions.map((n) => (
                <option key={n} value={n}>
                  {midiToNoteName(n)}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => {
              setFirstMidi(FIRST_MIDI);
              setLastMidi(LAST_MIDI);
              setThemeId("classic");
            }}
            style={{ ...btnStyle, justifyContent: "center" }}
          >
            Reset to defaults
          </button>
        </div>
      )}

      {/* Visualizer — piano fills bottom, transparent above */}
      <div
        ref={wrapperRef}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
        }}
      >
        <Keyboard geometry={geometry} activeNotes={activeNotes} theme={theme} />
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#1f2937",
  color: "#fff",
  border: "1px solid #374151",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.75,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const selectStyle: React.CSSProperties = {
  background: "#111827",
  color: "#fff",
  border: "1px solid #374151",
  borderRadius: 6,
  padding: "6px 8px",
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
};

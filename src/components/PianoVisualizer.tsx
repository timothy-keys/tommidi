import { useEffect, useRef, useState } from "react";
import { Keyboard } from "./Keyboard";
import { useMidiInput } from "../hooks/useMidiInput";
import { SvgRecorder, downloadBlob } from "../lib/recorder";
import { KEYBOARD_WIDTH, LABEL_STRIP_HEIGHT, WHITE_KEY_HEIGHT } from "../lib/piano-geometry";

const RENDER_WIDTH = 1920;
const RENDER_HEIGHT = Math.round(
  (RENDER_WIDTH * (LABEL_STRIP_HEIGHT + WHITE_KEY_HEIGHT)) / KEYBOARD_WIDTH,
);

export function PianoVisualizer() {
  const { activeNotes, status } = useMidiInput();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<SvgRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
    };
  }, []);

  const startRecording = () => {
    const svg = wrapperRef.current?.querySelector("svg");
    if (!svg) return;
    try {
      const rec = new SvgRecorder(svg as SVGSVGElement, RENDER_WIDTH, RENDER_HEIGHT);
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
        <Keyboard activeNotes={activeNotes} />
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

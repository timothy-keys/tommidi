import { useEffect, useState } from "react";

export type MidiStatus = "idle" | "connected" | "waiting" | "unsupported" | "denied";

export function useMidiInput() {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(() => new Set());
  const [status, setStatus] = useState<MidiStatus>("idle");

  useEffect(() => {
    const nav = navigator as Navigator & {
      requestMIDIAccess?: (opts?: { sysex?: boolean }) => Promise<MIDIAccess>;
    };
    if (!nav.requestMIDIAccess) {
      setStatus("unsupported");
      return;
    }

    let access: MIDIAccess | null = null;
    let cancelled = false;

    const handleMessage = (e: MIDIMessageEvent) => {
      const data = e.data;
      if (!data || data.length < 2) return;
      const status = data[0] & 0xf0;
      const note = data[1];
      const velocity = data[2] ?? 0;
      if (status === 0x90 && velocity > 0) {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.add(note);
          return next;
        });
      } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
        setActiveNotes((prev) => {
          if (!prev.has(note)) return prev;
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }
    };

    const attachInputs = () => {
      if (!access) return;
      const inputs = Array.from(access.inputs.values());
      inputs.forEach((input) => {
        input.onmidimessage = handleMessage;
      });
      setStatus(inputs.length > 0 ? "connected" : "waiting");
    };

    setStatus("waiting");
    nav
      .requestMIDIAccess()
      .then((a) => {
        if (cancelled) return;
        access = a;
        attachInputs();
        a.onstatechange = attachInputs;
      })
      .catch(() => {
        if (!cancelled) setStatus("denied");
      });

    return () => {
      cancelled = true;
      if (access) {
        Array.from(access.inputs.values()).forEach((i) => (i.onmidimessage = null));
        access.onstatechange = null;
      }
    };
  }, []);

  return { activeNotes, status };
}

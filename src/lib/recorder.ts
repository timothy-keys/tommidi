// Records an SVG element as a transparent WebM (VP9 alpha) via canvas.captureStream.

export type RecorderState = "idle" | "recording";

export class SvgRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private rafId: number | null = null;
  private svg: SVGSVGElement;
  private width: number;
  private height: number;
  private mimeType = "";
  public onStop: ((blob: Blob, mimeType: string) => void) | null = null;

  constructor(svg: SVGSVGElement, width: number, height: number) {
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
  }

  private pickMime(): string {
    // Prefer MP4 when the browser supports it; fall back to WebM (VP9 supports alpha).
    const candidates = [
      "video/mp4;codecs=avc1",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
    }
    return "";
  }

  extensionForMime(): string {
    return this.mimeType.startsWith("video/mp4") ? "mp4" : "webm";
  }

  private renderFrame = () => {
    const clone = this.svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(this.width));
    clone.setAttribute("height", String(this.height));
    // Strip elements meant only for the on-screen preview (e.g. chord backdrop).
    clone.querySelectorAll("[data-live-only]").forEach((el) => el.remove());
    const xml = new XMLSerializer().serializeToString(clone);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const url = `data:image/svg+xml;base64,${svg64}`;
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.drawImage(img, 0, 0, this.width, this.height);
    };
    img.src = url;
    this.rafId = requestAnimationFrame(this.renderFrame);
  };

  start() {
    const mime = this.pickMime();
    if (!mime) throw new Error("WebM recording not supported in this browser");
    this.mimeType = mime;
    this.chunks = [];
    const stream = this.canvas.captureStream(60);
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: mime });
      this.onStop?.(blob, mime);
    };
    this.mediaRecorder.start(100);
    this.renderFrame();
  }

  stop() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

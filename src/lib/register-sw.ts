// Guarded PWA registration — never registers in dev/preview/iframe.
// Enables offline support only on the published site.

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const url = new URL(window.location.href);
  const host = window.location.hostname;
  const inIframe = window.self !== window.top;
  const isPreviewHost =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  const killSwitch = url.searchParams.get("sw") === "off";

  const shouldRefuse =
    !import.meta.env.PROD || inIframe || isPreviewHost || killSwitch;

  if (shouldRefuse) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => {
        const scriptURL = r.active?.scriptURL ?? "";
        if (scriptURL.endsWith("/sw.js")) r.unregister();
      });
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW registration failed", err);
    });
  });
}

import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        filename: "sw.js",
        manifest: {
          name: "MIDI Piano Visualizer",
          short_name: "MIDI Piano",
          description:
            "Transparent 88-key MIDI piano visualizer for YouTube lesson videos.",
          theme_color: "#000000",
          background_color: "#000000",
          display: "standalone",
          start_url: "/",
          icons: [
            { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
          ],
        },
        workbox: {
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-nav",
                networkTimeoutSeconds: 3,
              },
            },
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin &&
                ["style", "script", "worker", "font", "image"].includes(
                  request.destination,
                ),
              handler: "CacheFirst",
              options: {
                cacheName: "assets",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  },
});

// إعداد بناء خاص بتطبيق الآيفون (Capacitor):
// يبني نسخة "صفحة واحدة" ثابتة تعمل داخل الجهاز بدون خادم.
// لا يؤثر على بناء الموقع العادي (vite.config.ts).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: {
      enabled: true,
      prerender: { enabled: true, outputPath: "/index.html", crawlLinks: false },
    },
  },
  vite: {
    build: { outDir: "dist-ios" },
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        filename: "sw.js",
        devOptions: { enabled: false },
        manifest: false,
        workbox: {
          globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
          navigateFallback: "/index.html",
        },
      }),
    ],
  },
});

// إعداد بناء خاص بتطبيق الآيفون (Capacitor):
// يبني نسخة "صفحة واحدة" ثابتة تعمل داخل الجهاز بدون خادم.
// لا يؤثر على بناء الموقع العادي (vite.config.ts).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: { enabled: true, outputPath: "/index.html", crawlLinks: false },
    },
  },
});

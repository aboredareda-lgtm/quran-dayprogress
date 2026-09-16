// إعداد بناء خاص بتطبيق الآيفون (Capacitor):
// يبني نسخة "صفحة واحدة" ثابتة تعمل داخل الجهاز بدون خادم وبدون Service Worker.
// لا يؤثر على بناء الموقع العادي (vite.config.ts).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: { enabled: true, outputPath: "/index.html", crawlLinks: false },
    },
  },
});

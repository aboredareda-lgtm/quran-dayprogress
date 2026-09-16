# تصدير ملف IPA لتطبيق «الوِرد» على الآيفون

المشروع مُهيّأ الآن لإنتاج نسخة تعمل **داخل الجهاز بدون إنترنت**.

## على جهاز الماك (مرة واحدة)

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/ios
npm run build:ios          # يبني النسخة الثابتة في dist/client
npx cap add ios            # ينشئ مشروع iOS
npx cap sync ios
npx cap open ios           # يفتح Xcode
```

## في Xcode

1. اختر الهدف (Target) ثم تبويب **Signing & Capabilities**.
2. فعّل **Automatically manage signing** واختر حسابك في **Team**.
3. اختر الجهاز: **Any iOS Device (arm64)**.
4. من القائمة: **Product → Archive**.
5. بعد انتهاء الأرشفة يفتح Organizer:
   - **Distribute App → App Store Connect** للرفع إلى المتجر.
   - أو **Distribute App → Export** للحصول على ملف **.ipa** على جهازك.

## عند أي تعديل لاحق على البرنامج

```bash
npm run build:ios
npx cap sync ios
```

ثم أعِد خطوة Archive في Xcode.

## ملاحظات

- ملف `capacitor.config.json` يحدد اسم التطبيق ومعرّفه (`com.aboreda.wird`) — عدّل المعرّف إن أردت.
- الأيقونات: ضع أيقونة 1024×1024 في Xcode داخل `App/Assets.xcassets/AppIcon`.
- جميع بيانات القراءة تُحفظ داخل الجهاز، فلا يحتاج التطبيق أي خادم.

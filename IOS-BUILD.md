# بناء تطبيق الوِرد للآيفون

المشروع يحتوي على تطبيق iOS من Capacitor، ومعرّفه `com.aboreda.wird`. تطبيق الويب المضمّن يعمل دون اتصال لخدمات القراءة الأساسية. التذكير المحلي يُجدول على الجهاز عند تفعيله بعد منح الإذن.

## المتطلبات

- Xcode وApple Developer Team يملك `com.aboreda.wird`.
- شهادة Apple Distribution وملف provisioning من الفريق الصحيح لبناء الأرشيف الموقّع.
- سجّل التطبيق في App Store Connect بالمعرّف نفسه.

## تطوير واختبار

```bash
npm ci
npm run build:ios
npx cap sync ios
npx tsc --noEmit
bun test tests/backup-and-date.test.ts
open ios/App/App.xcodeproj
```

شغّل `App` على محاكي iPhone، واختبر بدء التطبيق وتسجيل قراءة والتاريخ والإعدادات وسياسة الخصوصية، ثم تفعيل وإيقاف التذكير وتصدير واستعادة النسخة الاحتياطية. تأكد أيضًا من التشغيل دون إنترنت بعد تثبيت التطبيق.

## أرشفة المتجر

في Xcode اختر Team الصحيح من Signing & Capabilities، ثم `Any iOS Device` و`Product > Archive`. ارفع الأرشيف من Organizer أو صدّره كـ IPA وارفعه بـ Transporter أو أداة Apple الرسمية. لا تضع مفاتيح API أو الشهادات أو ملفات IPA في Git.

رابط سياسة الخصوصية المقترح لـ App Store Connect بعد نشر تغييرات الويب: `https://quran-dayprogress.lovable.app/privacy`. تحقق من فتحه علنًا قبل إرسال التطبيق للمراجعة.

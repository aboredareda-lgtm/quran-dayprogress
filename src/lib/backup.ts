import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { validateBackup } from "./backup-schema";
import { LocalNotifications } from "@capacitor/local-notifications";

/** نسخة احتياطية: تصدير بيانات الجهاز واستعادتها */

const KEYS = [
  "quran-reading-log-v1",
  "wird:daily-goal-ayahs",
  "wird:khatmahs",
  "wird:reminder",
  "wird:theme",
  "wird:welcomed",
] as const;

export type BackupFile = {
  app: "wird";
  version: 1;
  createdAt: string;
  data: Record<string, string>;
};

export function buildBackup(): BackupFile {
  const data: Record<string, string> = {};
  for (const key of KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return { app: "wird", version: 1, createdAt: new Date().toISOString(), data };
}

export async function downloadBackup() {
  const backup = buildBackup();
  if (Capacitor.isNativePlatform()) {
    const path = `wird-backup-${backup.createdAt.slice(0, 10)}.json`;
    const file = await Filesystem.writeFile({
      path,
      data: JSON.stringify(backup, null, 2),
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: "نسخة الوِرد الاحتياطية", files: [file.uri] });
    return;
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wird-backup-${backup.createdAt.slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** يستعيد النسخة ويعيد عدد المفاتيح المستعادة، أو يرمي خطأ إن كان الملف غير صالح */
export async function restoreBackup(file: File): Promise<number> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Backup too large");
  const data = validateBackup(await file.text());
  const previous = new Map(Object.keys(data).map((key) => [key, localStorage.getItem(key)]));
  if (Capacitor.isNativePlatform() && data["wird:reminder"])
    await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
  try {
    for (const [key, value] of Object.entries(data)) localStorage.setItem(key, value);
  } catch (error) {
    for (const [key, value] of previous) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    throw error;
  }
  return Object.keys(data).length;
}

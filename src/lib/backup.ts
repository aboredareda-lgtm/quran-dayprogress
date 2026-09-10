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

export function downloadBackup() {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wird-backup-${backup.createdAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** يستعيد النسخة ويعيد عدد المفاتيح المستعادة، أو يرمي خطأ إن كان الملف غير صالح */
export async function restoreBackup(file: File): Promise<number> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<BackupFile>;
  if (!parsed || parsed.app !== "wird" || typeof parsed.data !== "object") {
    throw new Error("ملف غير صالح");
  }
  let restored = 0;
  for (const key of KEYS) {
    const value = parsed.data?.[key];
    if (typeof value === "string") {
      localStorage.setItem(key, value);
      restored += 1;
    }
  }
  return restored;
}

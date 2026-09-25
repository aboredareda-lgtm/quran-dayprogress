import { z } from "zod";
import { SURAHS } from "./surahs";
const date = z.string().datetime({ offset: true });
export const readingEntriesSchema = z
  .array(
    z
      .object({
        id: z.string().min(1).max(200),
        surah: z.number().int().min(1).max(114),
        ayah: z.number().int().min(1),
        at: date,
        note: z.string().max(120).optional(),
      })
      .refine((e) => e.ayah <= SURAHS[e.surah - 1]!.ayahs),
  )
  .max(100000);
export const khatmahsSchema = z
  .array(z.object({ id: z.string().min(1).max(200), at: date }))
  .max(100000);
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const reminderSchema = z.object({ enabled: z.boolean(), time: timeSchema });
export const backupValueSchemas: Record<string, z.ZodTypeAny> = {
  "quran-reading-log-v1": readingEntriesSchema,
  "wird:daily-goal-ayahs": z.number().int().min(1).max(6236),
  "wird:khatmahs": khatmahsSchema,
  "wird:reminder": reminderSchema,
};
export function validateBackup(text: string): Record<string, string> {
  const backup = z
    .object({
      app: z.literal("wird"),
      version: z.literal(1),
      createdAt: date,
      data: z.record(z.string()),
    })
    .parse(JSON.parse(text));
  const validated: Record<string, string> = {};
  for (const [key, value] of Object.entries(backup.data)) {
    if (backupValueSchemas[key]) {
      backupValueSchemas[key].parse(JSON.parse(value));
      validated[key] = value;
    } else if (key === "wird:theme") {
      z.enum(["light", "dark"]).parse(value);
      validated[key] = value;
    } else if (key === "wird:welcomed") {
      z.literal("1").parse(value);
      validated[key] = value;
    }
  }
  if (!Object.keys(validated).length) throw new Error("Empty backup");
  // Importing a file must never opt the recipient into notifications.
  if (validated["wird:reminder"])
    validated["wird:reminder"] = JSON.stringify({
      ...JSON.parse(validated["wird:reminder"]),
      enabled: false,
    });
  return validated;
}

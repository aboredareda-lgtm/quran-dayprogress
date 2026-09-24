import { describe, expect, it } from "bun:test";
import { validateBackup } from "../src/lib/backup-schema";
import { localDayKey } from "../src/lib/local-date";

const wrap = (data: Record<string, string>) =>
  JSON.stringify({
    app: "wird",
    version: 1,
    createdAt: "2026-09-24T04:00:00.000Z",
    data,
  });

describe("backup validation", () => {
  it("accepts valid progress and turns imported reminders off", () => {
    const value = validateBackup(
      wrap({
        "quran-reading-log-v1": JSON.stringify([
          { id: "one", surah: 1, ayah: 7, at: "2026-09-24T04:00:00.000Z" },
        ]),
        "wird:daily-goal-ayahs": "50",
        "wird:reminder": JSON.stringify({ enabled: true, time: "20:00" }),
      }),
    );
    expect(value["quran-reading-log-v1"]).toContain('"surah":1');
    expect(JSON.parse(value["wird:reminder"]!).enabled).toBe(false);
  });

  it("rejects corrupt data before mutation", () => {
    expect(() =>
      validateBackup(
        wrap({
          "quran-reading-log-v1": JSON.stringify([
            { id: "bad", surah: 1, ayah: 999, at: "2026-09-24T04:00:00.000Z" },
          ]),
        }),
      ),
    ).toThrow();
    expect(() => validateBackup(wrap({ "wird:daily-goal-ayahs": "not-a-number" }))).toThrow();
    expect(() =>
      validateBackup(wrap({ "wird:reminder": JSON.stringify({ enabled: true, time: "99:99" }) })),
    ).toThrow();
  });
});

describe("local day", () => {
  it("uses device calendar dates around UTC midnight", () => {
    const date = new Date("2026-09-23T23:30:00.000Z");
    expect(localDayKey(date)).toBe(
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date),
    );
  });
});

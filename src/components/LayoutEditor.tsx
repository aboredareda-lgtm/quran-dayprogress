// أداة مؤقتة لترتيب أجزاء صفحة المتابعة وتكبيرها — تُحذف بعد اعتماد التصميم.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Item = { order: number; scale: number; hidden: boolean };
type Layout = Record<string, Item>;
const KEY = "wird:temp-layout";

type Ctx = {
  editing: boolean;
  layout: Layout;
  ids: string[];
  update: (id: string, patch: Partial<Item>) => void;
  move: (id: string, dir: -1 | 1) => void;
};
const LayoutCtx = createContext<Ctx | null>(null);

export function LayoutProvider({ ids, children }: { ids: string[]; children: ReactNode }) {
  const initial = (): Layout =>
    Object.fromEntries(ids.map((id, i) => [id, { order: i, scale: 1, hidden: false }]));
  const [layout, setLayout] = useState<Layout>(initial);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLayout({ ...initial(), ...JSON.parse(raw) });
    } catch {
      /* تجاهل */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (next: Layout) => {
    setLayout(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* تجاهل */
    }
  };
  const update = (id: string, patch: Partial<Item>) =>
    save({ ...layout, [id]: { ...layout[id], ...patch } });
  const move = (id: string, dir: -1 | 1) => {
    const sorted = [...ids].sort((a, b) => layout[a].order - layout[b].order);
    const i = sorted.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    const next = { ...layout };
    sorted.forEach((k, n) => (next[k] = { ...next[k], order: n }));
    save(next);
  };

  return (
    <LayoutCtx.Provider value={{ editing, layout, ids, update, move }}>
      {children}
      <div className="fixed bottom-3 left-3 z-[60] flex flex-col gap-2">
        {editing && (
          <button
            onClick={() => window.confirm("استرجاع التصميم الأصلي؟") && save(initial())}
            className="rounded-full border-2 border-gold/60 bg-card px-3 py-2 text-xs font-bold text-primary"
          >
            ↺ الأصلي
          </button>
        )}
        <button
          onClick={() => setEditing((v) => !v)}
          className="rounded-full border-2 border-gold/60 bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          {editing ? "✓ تم" : "✏️ ترتيب الصفحة"}
        </button>
      </div>
    </LayoutCtx.Provider>
  );
}

export function Block({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  const ctx = useContext(LayoutCtx);
  if (!ctx) return <>{children}</>;
  const item = ctx.layout[id];
  if (item.hidden && !ctx.editing) return null;
  const btn = "rounded-full bg-card px-2 py-0.5 text-sm font-bold text-primary border border-gold/50";
  return (
    <div
      style={{ order: item.order }}
      className={ctx.editing ? "rounded-2xl border-2 border-dashed border-primary/60 p-1" : ""}
    >
      {ctx.editing && (
        <div className="mb-1 flex flex-wrap items-center justify-center gap-1 text-xs">
          <span className="font-bold text-primary">{label}</span>
          <button className={btn} onClick={() => ctx.move(id, -1)}>⬆️</button>
          <button className={btn} onClick={() => ctx.move(id, 1)}>⬇️</button>
          <button className={btn} onClick={() => ctx.update(id, { scale: Math.max(0.6, +(item.scale - 0.05).toFixed(2)) })}>➖</button>
          <span className="text-muted-foreground">{Math.round(item.scale * 100)}%</span>
          <button className={btn} onClick={() => ctx.update(id, { scale: Math.min(1.6, +(item.scale + 0.05).toFixed(2)) })}>➕</button>
          <button className={btn} onClick={() => ctx.update(id, { hidden: !item.hidden })}>
            {item.hidden ? "🙈" : "👁️"}
          </button>
        </div>
      )}
      <div style={{ zoom: item.scale, opacity: item.hidden ? 0.3 : 1 }}>{children}</div>
    </div>
  );
}

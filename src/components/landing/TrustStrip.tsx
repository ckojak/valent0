import { INSURERS } from "@/lib/quote-data";

const EXTRA = [
  { id: "hdi", name: "HDI", initials: "HD", color: "#005CA9" },
  { id: "sulamerica", name: "SulAmérica", initials: "SA", color: "#F58220" },
];

export function TrustStrip() {
  const all = [...INSURERS, ...EXTRA];
  return (
    <section className="border-y bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trabalhamos com as seguradoras que você confia
        </p>
        <div className="mt-5 grid grid-cols-3 items-center gap-4 sm:grid-cols-6">
          {all.map((ins) => (
            <div
              key={ins.id}
              className="flex items-center justify-center gap-2 opacity-80 transition hover:opacity-100"
            >
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-xs font-bold text-white"
                style={{ backgroundColor: ins.color }}
              >
                {ins.initials}
              </div>
              <span className="truncate text-xs font-semibold text-foreground sm:text-sm">
                {ins.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { Insurer } from "@/lib/quote-data";

export function InsurerLogo({ insurer, size = 44 }: { insurer: Insurer; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-xl font-display font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: insurer.color,
        fontSize: size * 0.4,
        letterSpacing: "-0.02em",
      }}
      aria-label={insurer.name}
    >
      {insurer.initials}
    </div>
  );
}

/**
 * Recurring visual motifs: line-art metaballs (the "sulcus" groove where regions
 * meet), technical hairline rings, and duotone concentric contours.
 * Purely decorative — no copy, no semantics.
 */

export function MetaballMark({
  className = "",
  variant = 0,
}: {
  className?: string;
  variant?: number;
}) {
  const sets: Array<Array<[number, number, number]>> = [
    [
      [22, 24, 15],
      [38, 30, 18],
      [29, 43, 13],
    ],
    [
      [26, 22, 13],
      [40, 34, 16],
      [22, 40, 17],
    ],
    [
      [30, 20, 12],
      [20, 36, 16],
      [42, 38, 14],
    ],
    [
      [24, 28, 17],
      [40, 24, 12],
      [33, 44, 15],
    ],
    [
      [21, 30, 14],
      [36, 21, 13],
      [38, 42, 16],
    ],
    [
      [32, 24, 16],
      [22, 42, 13],
      [43, 36, 12],
    ],
  ];
  const circles = sets[variant % sets.length] ?? sets[0]!;
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      {circles.map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

export function HairlineRings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" aria-hidden="true">
      {[60, 105, 150, 195].map((r) => (
        <circle
          key={r}
          cx={200}
          cy={200}
          r={r}
          stroke="currentColor"
          strokeWidth={0.6}
          opacity={0.35}
        />
      ))}
      <circle cx={200} cy={200} r={3} fill="currentColor" opacity={0.8} />
    </svg>
  );
}

/** Duotone concentric contour field — chromatic-offset print feel. */
export function ContourField({ className = "" }: { className?: string }) {
  const rings = Array.from({ length: 26 }, (_, i) => 8 + i * 7);
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" aria-hidden="true">
      <g opacity={0.5} transform="translate(-4,-3)">
        {rings.map((r) => (
          <ellipse
            key={`a${r}`}
            cx={200}
            cy={200}
            rx={r}
            ry={r * 1.12}
            stroke="#2E6BFF"
            strokeWidth={0.9}
          />
        ))}
      </g>
      <g opacity={0.45} transform="translate(4,3)">
        {rings.map((r) => (
          <ellipse
            key={`b${r}`}
            cx={200}
            cy={200}
            rx={r}
            ry={r * 1.12}
            stroke="#FF3B30"
            strokeWidth={0.9}
          />
        ))}
      </g>
      <g opacity={0.6}>
        {rings.map((r) => (
          <ellipse
            key={`c${r}`}
            cx={200}
            cy={200}
            rx={r}
            ry={r * 1.12}
            stroke="#F2F0EB"
            strokeWidth={0.5}
          />
        ))}
      </g>
    </svg>
  );
}

/** Metaball divider used between sections to carry the motif through the page. */
export function MotifDivider({ variant = 0 }: { variant?: number }) {
  return (
    <div className="flex items-center gap-4 py-2" aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      <MetaballMark variant={variant} className="h-7 w-7 text-primary/70" />
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

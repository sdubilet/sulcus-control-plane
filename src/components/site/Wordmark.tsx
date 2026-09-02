import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary" aria-hidden="true">
        <path
          d="M3 17c4 0 4-10 9-10s5 10 9 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="square"
        />
        <path d="M3 7h6M15 7h6" stroke="currentColor" strokeWidth="1.75" opacity="0.35" />
      </svg>
      <span
        className="font-display text-sm font-semibold tracking-[0.34em] text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        SULCUS
      </span>
    </span>
  );
}

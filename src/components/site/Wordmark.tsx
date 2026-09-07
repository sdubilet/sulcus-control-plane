import { cn } from "@/lib/utils";
import logoAsset from "@/assets/sulcus-mark.png.asset.json";

export function WordmarkMark({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.src}
      alt="Sulcus mark"
      className={cn("inline-block object-contain", className)}
      width={logoAsset.width}
      height={logoAsset.height}
      loading="eager"
      decoding="async"
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <WordmarkMark className="h-5 w-5 shrink-0" />
      <span className="font-sans text-lg font-semibold tracking-[0.22em] text-foreground">
        SULCUS
      </span>
    </div>
  );
}

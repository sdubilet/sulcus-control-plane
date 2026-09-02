import { Link } from "@tanstack/react-router";
import { Wordmark } from "./Wordmark";

const links = [
  { label: "Product", href: "#product" },
  { label: "Architecture", href: "#architecture" },
  { label: "Vision", href: "#vision" },
  { label: "Company", href: "#team" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 md:flex-row md:items-start md:justify-between">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Control infrastructure for autonomous AI.
          </p>
          <p className="mt-6 font-mono text-xs text-muted-foreground">sulcus.dev</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          <span className="text-sm text-muted-foreground/50" title="Link pending">
            GitHub
          </span>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <p className="font-mono text-[11px] text-muted-foreground/70">
            © {new Date().getFullYear()} Sulcus · The control layer for autonomous AI.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="pointer-events-none absolute right-0 top-0 opacity-[0.03]" aria-hidden="true">
        <Wordmark className="h-64 w-64 text-primary md:h-80 md:w-80" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div>
            <Wordmark className="h-7" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Runtime control for AI agents. Supervise, coordinate, observe, and control
              autonomous systems in production.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a href="mailto:sofiia@sulcus.dev" className="text-sm text-foreground transition-colors hover:text-primary">
              sofiia@sulcus.dev
            </a>
            <a href="mailto:elariz@sulcus.dev" className="text-sm text-foreground transition-colors hover:text-primary">
              elariz@sulcus.dev
            </a>
            <a href="mailto:milan@sulcus.dev" className="text-sm text-foreground transition-colors hover:text-primary">
              milan@sulcus.dev
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Sulcus. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

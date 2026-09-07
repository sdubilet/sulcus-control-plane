import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Wordmark } from "./Wordmark";

const links = [
  { label: "Architecture", href: "#coordination" },
  { label: "Product", href: "#product" },
  { label: "Contact", href: "/contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border/60 bg-background/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Wordmark className="h-6" />
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              {l.href.startsWith("#") ? (
                <a href={l.href} className="text-xs font-medium tracking-wide text-foreground/80 transition-colors hover:text-primary">
                  {l.label}
                </a>
              ) : (
                <Link to={l.href} className="text-xs font-medium tracking-wide text-foreground/80 transition-colors hover:text-primary">
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <Link
          to="/contact"
          className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
        >
          Talk to the team
        </Link>
      </nav>
    </header>
  );
}

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const links = [
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Join", href: "#join" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary shadow-glow group-hover:animate-pulse-glow" />
          <span className="font-mono text-sm tracking-widest uppercase">
            KTH <span className="text-primary">Robotics</span>
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <a href="#join">Apply</a>
        </Button>
      </nav>
    </header>
  );
}

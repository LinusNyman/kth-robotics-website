import { lazy, Suspense } from "react";
import { GENERAL_MEETING_DATE_DISPLAY } from "@/lib/site-config";

const HeroFlow = lazy(() => import("@/components/HeroFlow"));

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Join", href: "#join" },
  { label: "FAQ", href: "#faq" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative w-full overflow-hidden h-[60vh] min-h-[480px] isolate"
    >
      {/* Soft radial backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, hsl(var(--primary) / 0.18) 0%, transparent 60%), hsl(var(--background))",
        }}
      />

      <div className="pointer-events-none absolute -top-[10%] -bottom-[10%] left-1/2 -translate-x-1/2 w-[180%] sm:w-[160%] md:w-[150%]">
        <div className="pointer-events-auto w-full h-full">
          <Suspense fallback={null}>
            <HeroFlow />
          </Suspense>
        </div>
      </div>

      

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <h1 className="uppercase text-4xl sm:text-5xl md:text-6xl font-extrabold text-white animate-fade-in">
          KTH ROBOTICS
        </h1>
        <p
          className="mt-2 font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-black animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          Stockholm · Founding {GENERAL_MEETING_DATE_DISPLAY}
        </p>
      </div>
    </section>
  );
}

export function HeroNav() {
  return (
    <nav className="border-b border-border/60">
      <div className="container max-w-5xl flex items-center justify-center gap-10 py-5">
        {navLinks.map((l) => {
          const isJoin = l.href === "#join";
          return (
            <a
              key={l.href}
              href={l.href}
              className={
                isJoin
                  ? "join-pill text-xs font-mono uppercase tracking-[0.25em] font-semibold"
                  : "text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors"
              }
            >
              {l.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

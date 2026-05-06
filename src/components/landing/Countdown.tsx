import { useEffect, useState } from "react";
import { GENERAL_MEETING_DATE, GENERAL_MEETING_DATE_DISPLAY } from "@/lib/site-config";

function getRemaining() {
  const diff = Math.max(0, GENERAL_MEETING_DATE.getTime() - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { diff, days, hours, minutes, seconds };
}

const pad = (n: number) => n.toString().padStart(2, "0");

export default function Countdown() {
  const [t, setT] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setT(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const passed = t.diff === 0;

  const tiles: { label: string; value: string }[] = [
    { label: "Days", value: String(t.days) },
    { label: "Hours", value: pad(t.hours) },
    { label: "Minutes", value: pad(t.minutes) },
    { label: "Seconds", value: pad(t.seconds) },
  ];

  return (
    <section id="countdown" className="relative py-20 sm:py-28">
      <div className="container max-w-4xl text-center">
        <span className="font-mono text-xs tracking-[0.3em] uppercase text-primary">
          Countdown to General Meeting
        </span>
        <p className="mt-3 font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
          {GENERAL_MEETING_DATE_DISPLAY}
        </p>

        {passed ? (
          <h2 className="mt-8 text-4xl sm:text-5xl font-extrabold">
            <span className="text-gradient-red">We're live.</span>
          </h2>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className="group rounded-md border border-border bg-card p-5 sm:p-7 transition-colors hover:border-primary/60"
              >
                <div className="font-extrabold tabular-nums text-4xl sm:text-5xl md:text-6xl leading-none">
                  {tile.value}
                </div>
                <div className="mt-3 font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase text-muted-foreground">
                  {tile.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

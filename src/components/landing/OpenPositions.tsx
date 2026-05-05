import { useOpenPositions } from "@/hooks/useOpportunitiesData";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Committee } from "@/data/opportunities";

const committeeBadgeClass = (_c: Committee) =>
  "bg-black text-white border-transparent hover:bg-black";

const committeeOrder: Record<Committee, number> = {
  Board: 0,
  Development: 1,
  Operations: 2,
};

export default function OpenPositions() {
  const { data: positionsRaw = [], isLoading } = useOpenPositions();
  const positions = [...positionsRaw].sort((a, b) => {
    const c = committeeOrder[a.committee] - committeeOrder[b.committee];
    return c !== 0 ? c : a.role.localeCompare(b.role);
  });

  return (
    <section id="positions" className="relative py-20 sm:py-28 scroll-mt-24">
      <div className="container max-w-5xl">
        <div className="mb-10">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-primary">
            Open Roles
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
            Open Positions
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Specific roles we're recruiting for right now. Don't see a fit?
            Submit a general application below.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div className="border border-border bg-card p-10 text-center text-muted-foreground">
            No open positions right now — general applications are still
            welcome.
          </div>
        ) : (
          <div className="grid gap-6">
            {positions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const committeeKey = p.committee.toLowerCase();
                  window.dispatchEvent(
                    new CustomEvent("apply:prefill", {
                      detail: { committee: committeeKey, positionId: p.id },
                    }),
                  );
                  document
                    .getElementById("join")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group text-left border border-border bg-card p-8 sm:p-10 flex flex-col transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.3)]"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    {p.role}
                  </h3>
                  <Badge className={committeeBadgeClass(p.committee)}>
                    {p.committee}
                  </Badge>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {p.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

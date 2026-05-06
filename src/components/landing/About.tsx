import { Cpu, Trophy, Users } from "lucide-react";
import { GENERAL_MEETING_DATE_DISPLAY } from "@/lib/site-config";

const pillars = [
  {
    icon: Cpu,
    title: "Build",
    body: "Build real robots — robot arms, drones, autonomous platforms — bringing together mechanical, electrical and software work. Hands-on engineering, end-to-end, with applied machine learning at the core.",
  },
  {
    icon: Trophy,
    title: "Compete",
    body: "Represent KTH at student robotics competitions across Europe. Train, iterate and ship together — and put KTH on the leaderboard.",
  },
  {
    icon: Users,
    title: "Connect",
    body: "Build a network — industry partners, alumni and research labs across Stockholm — and work toward a permanent lab home for hands-on robotics at KTH.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-28 sm:py-36">
      <div className="container max-w-5xl text-center">
        <div className="mx-auto max-w-2xl">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-primary">
            About
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold">
            A society for people who{" "}
            <span className="text-gradient-red">make things move</span>.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-justify">
            KTH Robotics is an upcoming student association at KTH Royal Institute of Technology in
            Stockholm — to be formally established on <strong>{GENERAL_MEETING_DATE_DISPLAY}</strong>. A community of
            curious engineers — across mechatronics, computer science, electrical, mechanical and
            beyond — coming together to build real robots, learn by doing, and push what students
            can ship.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="group relative flex flex-col rounded-md border border-border bg-card p-7 transition-all duration-300 hover:border-primary/60 hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/30">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold">{p.title}</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              <span className="mt-auto pt-6 font-mono text-[10px] tracking-widest text-muted-foreground/60">
                0{i + 1} / 03
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

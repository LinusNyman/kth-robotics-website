import { Cpu, Trophy, Users } from "lucide-react";

const pillars = [
  {
    icon: Cpu,
    title: "Build",
    body: "Hands-on projects across mechanical, electrical and software domains — from autonomous rovers to robotic arms.",
  },
  {
    icon: Trophy,
    title: "Compete",
    body: "Aim to represent KTH at student robotics competitions across Europe as the society grows. Train, iterate and ship together.",
  },
  {
    icon: Users,
    title: "Connect",
    body: "Build a community of curious engineers, and grow ties with industry partners, alumni and research labs across Stockholm.",
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
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            KTH Robotics Society is a brand-new student association at KTH Royal Institute of Technology
            in Stockholm. We're a community of curious engineers — across mechatronics, computer science,
            electrical, mechanical and beyond — coming together to build real robots, learn by doing,
            and push what students can ship.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="group relative rounded-md border border-border bg-card p-7 transition-all duration-300 hover:border-primary/60 hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/30">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              <span className="mt-6 block font-mono text-[10px] tracking-widest text-muted-foreground/60">
                0{i + 1} / 03
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

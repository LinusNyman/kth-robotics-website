import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who can join?",
    a: "Any student enrolled at KTH, regardless of program or year. We welcome bachelor's, master's and PhD students.",
  },
  {
    q: "Do I need previous experience with robotics?",
    a: "No. Curiosity and commitment matter more than prior experience. We have onboarding tracks for beginners and deeper projects for advanced members.",
  },
  {
    q: "What kinds of projects will we work on?",
    a: "Autonomous ground robots, robotic arms, drones, computer-vision systems, and entries for European student robotics competitions. Members propose projects too.",
  },
  {
    q: "When and where do you meet?",
    a: "We're a brand-new society in our founding phase. Once the first cohort is onboarded, we'll run regular build sessions and workshops on KTH Campus Valhallavägen — exact times will be shared with members.",
  },
  {
    q: "What roles are available?",
    a: "We organise around three areas: Board (strategy and leadership), Development (technical R&D — robotics, software, mechanical, electrical, ML/CV) and Operations (partnerships, events, marketing, finance, design). See the Open Positions section for specific roles, or send a general application.",
  },
  {
    q: "How do I apply?",
    a: "Scroll to the Apply section below, pick the area that fits you (or apply generally), and submit the form. It takes about 5 minutes.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-28 sm:py-36">
      <div className="container max-w-3xl text-center">
        <span className="font-mono text-xs tracking-[0.3em] uppercase text-primary">
          FAQ
        </span>
        <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold">
          Questions, answered.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Everything you need to know before applying.
        </p>

        <Accordion type="single" collapsible className="mt-12 w-full text-left">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base hover:text-primary hover:no-underline">
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-primary/70">
                    0{i + 1}
                  </span>
                  {f.q}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pl-9">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

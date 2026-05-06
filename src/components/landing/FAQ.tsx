import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GENERAL_MEETING_DATE_DISPLAY } from "@/lib/site-config";

const faqs = [
  {
    q: "What is KTH Robotics?",
    a: `KTH Robotics is an upcoming student association at KTH Royal Institute of Technology, set to be formally established on ${GENERAL_MEETING_DATE_DISPLAY}. Build robots, compete across Europe, connect students with industry. Membership will be free.`,
  },
  {
    q: "Who is the initiative taker behind KTH Robotics?",
    a: "KTH Robotics is an initiative by KTHIS (KTH Industrial Society), which is also handling the founding process and applications. KTHIS have already completed a successful robotics project building drones, which became a Y Combinator start-up, worth over 40MSEK today. KTH Robotics will be a child association of KTHIS, joining its federated structure — autonomous in its own work, while sharing operational backing and a network of sister societies.",
  },
  {
    q: "Who can join?",
    a: "Any student enrolled at KTH, regardless of program or year. We welcome bachelor's, master's and PhD students.",
  },
  {
    q: "Do I need previous experience with robotics?",
    a: "No. Curiosity and commitment matter more than prior experience. Expect onboarding tracks for beginners and deeper projects for advanced members.",
  },
  {
    q: "What kinds of projects will we work on?",
    a: "Run hands-on robotics projects spanning robot arms, autonomous systems and drones — with applied machine learning across the stack. Members propose projects too: bring an idea, and if it fits the mission, it joins the portfolio.",
  },
  {
    q: "When and where will you meet?",
    a: `KTH Robotics will be formally established on ${GENERAL_MEETING_DATE_DISPLAY}. From there, regular build sessions and workshops will ramp up on KTH Campus Valhallavägen — times will be shared with members.`,
  },
  {
    q: "What roles will be available?",
    a: "Society leadership will be the Chair and Vice Chair. Below them: Development Leads owning technical projects, and Operations Leads running media, branding, events, partnerships and facilities. See Open Positions for specific roles, or send a general application.",
  },
  {
    q: "How do I apply?",
    a: "Head to the Apply section, pick the area that fits you (or apply generally), and submit the form. It takes about 5 minutes.",
  },
  {
    q: "What happens after I apply?",
    a: "Applications are read continuously, and shortlisted applicants will be invited to a conversation. The application process is handled by KTH Industrial Society.",
  },
  {
    q: "Is there a deadline?",
    a: `Applications are rolling and remain open until the general meeting on ${GENERAL_MEETING_DATE_DISPLAY}. Earlier is better — roles fill as suitable candidates are found.`,
  },
  {
    q: "What's the expected time commitment?",
    a: "Plan for around 8 hours per week, including build sessions, project work and meetings. It flexes with project phase and deadlines.",
  },
  {
    q: "What language do you operate in?",
    a: "English. Meetings, materials and applications are all in English so the society is open to international students at KTH.",
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

        <Accordion type="single" collapsible className="mt-12 w-full text-left">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-border"
            >
              <AccordionTrigger className="text-left text-base hover:text-primary hover:no-underline">
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-primary/70">
                    {String(i + 1).padStart(2, "0")}
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

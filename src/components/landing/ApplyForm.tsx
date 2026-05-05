import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useOpenPositions,
  useSubmitJoinApplication,
} from "@/hooks/useOpportunitiesData";
import type { Committee } from "@/data/opportunities";

const operationsAreas = [
  "Finance & Budgeting",
  "Corporate Partnerships & Sponsorships",
  "Academic Partnerships",
  "Graphic Design & Content Creation",
  "Marketing & Social Media & Copywriting",
  "Event Management & Logistics",
  "Web Development & IT",
  "Videography",
  "Board Support",
  "Other",
];

const developmentAreas = [
  "Robotics & Control Systems",
  "Machine Learning & Computer Vision",
  "Simulation & Digital Twins",
  "IT Infrastructure & Server Administration",
  "Software Engineering & Backend",
  "Mechanical Design & CAD",
  "Electrical Engineering & Electronics",
  "Other",
];

const boardAreas = [
  "Strategy & Vision",
  "Fundraising & Finance",
  "Team Leadership",
  "External Relations & Partnerships",
  "Governance & Compliance",
  "Other",
];

const joinSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(100),
    email: z.string().trim().email("Please enter a valid email").max(255),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    linkedin: z.string().trim().max(500).optional().or(z.literal("")),
    committee: z.enum(["operations", "development", "board", "general"], {
      required_error: "Please select an option",
    }),
    applicationType: z.enum(["specific", "general"]).default("general"),
    positionId: z.string().optional().or(z.literal("")),
    motivation: z
      .string()
      .trim()
      .min(10, "Please tell us a bit more about your motivation")
      .max(2000),
    experience: z
      .string()
      .trim()
      .min(10, "Please tell us about your qualities and experience")
      .max(2000),
    opsAreas: z.array(z.string()).optional(),
    opsOther: z.string().trim().max(500).optional().or(z.literal("")),
    devAreas: z.array(z.string()).optional(),
    devOther: z.string().trim().max(500).optional().or(z.literal("")),
    boardAreas: z.array(z.string()).optional(),
    boardOther: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.committee !== "general" && data.applicationType === "specific") {
      if (!data.positionId)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a position",
          path: ["positionId"],
        });
    }
  });

type JoinFormValues = z.infer<typeof joinSchema>;

const experienceLabel = (committee: string) => {
  switch (committee) {
    case "operations":
      return "What qualities and experience could you contribute to Operations? *";
    case "development":
      return "What qualities and experience could you contribute to Development? *";
    case "board":
      return "What qualities and experience could you contribute to the Board? *";
    default:
      return "What qualities and experience could you contribute to KTH Robotics? *";
  }
};

const committeeMap: Record<string, Committee> = {
  operations: "Operations",
  development: "Development",
  board: "Board",
};

export default function ApplyForm() {
  const { toast } = useToast();
  const { data: openPositions = [] } = useOpenPositions();
  const submitApplication = useSubmitJoinApplication();

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      committee: undefined,
      motivation: "",
      experience: "",
      applicationType: "general",
      positionId: "",
      opsAreas: [],
      opsOther: "",
      devAreas: [],
      devOther: "",
      boardAreas: [],
      boardOther: "",
    },
  });

  const committee = form.watch("committee");
  const applicationType = form.watch("applicationType");
  const opsAreas = form.watch("opsAreas") ?? [];
  const devAreas = form.watch("devAreas") ?? [];
  const watchedBoardAreas = form.watch("boardAreas") ?? [];

  const isSpecificCommittee = committee && committee !== "general";

  const filteredPositions = useMemo(() => {
    if (!isSpecificCommittee) return [];
    const target = committeeMap[committee as string];
    return openPositions.filter((p) => p.committee === target);
  }, [openPositions, isSpecificCommittee, committee]);

  const handleCommitteeChange = (value: string) => {
    form.setValue("committee", value as any, { shouldValidate: true });
    form.setValue("applicationType", "general");
    form.setValue("positionId", "");
  };

  // Listen for prefill events from the OpenPositions cards
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        committee?: string;
        positionId?: string;
      };
      if (!detail?.committee) return;
      form.setValue("committee", detail.committee as any, {
        shouldValidate: true,
      });
      form.setValue("applicationType", "specific");
      if (detail.positionId) {
        form.setValue("positionId", detail.positionId, {
          shouldValidate: true,
        });
      }
    };
    window.addEventListener("apply:prefill", handler as EventListener);
    return () =>
      window.removeEventListener("apply:prefill", handler as EventListener);
  }, [form]);

  const onSubmit = async (data: JoinFormValues) => {
    try {
      const isGeneralApp =
        data.committee === "general" || data.applicationType === "general";
      await submitApplication.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        linkedin: data.linkedin,
        committee: data.committee,
        motivation: data.motivation,
        experience: data.experience,
        application_type:
          data.committee === "general" ? "general" : data.applicationType,
        position_id:
          data.applicationType === "specific" ? data.positionId : undefined,
        ops_areas:
          data.committee === "operations" && isGeneralApp ? ["Other"] : [],
        dev_areas:
          data.committee === "development" && isGeneralApp ? ["Other"] : [],
        board_areas:
          data.committee === "board" && isGeneralApp ? ["Other"] : [],
      });
      toast({
        title: "Application submitted!",
        description:
          "Thanks for your interest in KTH Robotics. We'll get back to you shortly.",
      });
      form.reset();
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CheckboxGroup = ({
    items,
    fieldName,
    currentValues,
  }: {
    items: string[];
    fieldName: "opsAreas" | "devAreas" | "boardAreas";
    currentValues: string[];
  }) => (
    <div className="space-y-3">
      {items.map((item) => (
        <label
          key={item}
          className="flex items-start gap-3 cursor-pointer group"
        >
          <Checkbox
            checked={currentValues.includes(item)}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...currentValues, item]
                : currentValues.filter((v) => v !== item);
              form.setValue(fieldName, updated, { shouldValidate: true });
            }}
          />
          <span className="text-sm leading-none pt-0.5 text-foreground/80 group-hover:text-foreground transition-colors">
            {item}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <section id="join" className="relative py-20 sm:py-28 scroll-mt-24">
      <div className="container max-w-3xl">
        <div className="mb-10">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-primary">
            Join
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
            Apply to KTH Robotics
          </h2>
          <p className="mt-4 text-muted-foreground">
            We're organised around <strong>Operations</strong> (partnerships,
            events, marketing, finance, design), <strong>Development</strong>{" "}
            (technical R&D), and a <strong>Board</strong> driving strategy.
            Pick where you fit — or send a general application.
          </p>
        </div>

        <div className="border border-border bg-card p-6 md:p-10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-10"
            >
              <section className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+46 …" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn / Personal Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/in/…"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <FormField
                    control={form.control}
                    name="committee"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          Which part of KTH Robotics interests you? *
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={handleCommitteeChange}
                            value={field.value}
                            className="flex flex-col gap-3"
                          >
                            <label className="flex items-center gap-3 cursor-pointer">
                              <RadioGroupItem value="operations" />
                              <span className="text-sm">Operations</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <RadioGroupItem value="development" />
                              <span className="text-sm">Development</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <RadioGroupItem value="board" />
                              <span className="text-sm">Board</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <RadioGroupItem value="general" />
                              <span className="text-sm">General</span>
                            </label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isSpecificCommittee && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="applicationType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>How would you like to apply? *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(v) => {
                                  field.onChange(v);
                                  form.setValue("positionId", "");
                                }}
                                value={field.value}
                                className="flex flex-col gap-3"
                              >
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <RadioGroupItem value="general" />
                                  <span className="text-sm">
                                    General application
                                  </span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <RadioGroupItem value="specific" />
                                  <span className="text-sm">
                                    Apply for a specific position
                                  </span>
                                </label>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {applicationType === "specific" && (
                        <FormField
                          control={form.control}
                          name="positionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Position *</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        filteredPositions.length === 0
                                          ? "No positions available"
                                          : "Choose a position…"
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredPositions.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.role}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              {filteredPositions.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                  There are currently no open Board positions.
                                  You can submit a general application instead.
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What motivates you to join? *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us why you'd like to join…"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {committee && (
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{experienceLabel(committee)}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your relevant qualities and experience…"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </section>


              <Button
                type="submit"
                disabled={submitApplication.isPending}
                size="lg"
                className="w-full bg-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                {submitApplication.isPending
                  ? "Submitting…"
                  : "Submit Application"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}

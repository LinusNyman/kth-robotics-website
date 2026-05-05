import Hero, { HeroNav } from "@/components/landing/Hero";
import About from "@/components/landing/About";
import FAQ from "@/components/landing/FAQ";
import OpenPositions from "@/components/landing/OpenPositions";
import ApplyForm from "@/components/landing/ApplyForm";
import Footer from "@/components/landing/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "KTH Robotics — Build. Compete. Connect.";
    const desc =
      "KTH Robotics — a new student-led robotics society at KTH Royal Institute of Technology, Stockholm.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Hero />
        <HeroNav />
        <About />
        <ApplyForm />
        <OpenPositions />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

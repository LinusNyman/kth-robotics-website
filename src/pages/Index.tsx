import Hero, { HeroNav } from "@/components/landing/Hero";
import About from "@/components/landing/About";
import FAQ from "@/components/landing/FAQ";
import OpenPositions from "@/components/landing/OpenPositions";
import ApplyForm from "@/components/landing/ApplyForm";
import Footer from "@/components/landing/Footer";

const Index = () => {
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

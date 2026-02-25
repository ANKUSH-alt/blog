import Navbar from "@/components/navbar";
import Link from "next/link";
import HeroSection from "@/components/home/hero-section";
import FeaturesSection from "@/components/home/features-section";
import StatsSection from "@/components/home/stats-section";
import RoadmapSection from "@/components/home/roadmap-section";
import TestimonialSection from "@/components/home/testimonial-section";
import CtaSection from "@/components/home/cta-section";
import ContactSection from "@/components/home/contact-section";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen scroll-smooth">
      <Navbar />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. AI Features Highlight */}
      <FeaturesSection />

      {/* 3. Trust & Stats Section */}
      <StatsSection />

      {/* 4. Learning Roadmap Preview */}
      <RoadmapSection />

      {/* 5. Beautiful Testimonials */}
      <TestimonialSection />

      {/* 6. Call To Action */}
      <CtaSection />

      {/* 7. Contact Section */}
      <ContactSection />

      <footer className="py-10 border-t border-border mt-auto bg-background relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-muted-foreground">
          <p>© 2026 AI Era Academy. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0 text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

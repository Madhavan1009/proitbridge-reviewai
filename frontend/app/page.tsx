import { MarketingNav } from "@/components/shell/MarketingNav";
import { MarketingFooter } from "@/components/shell/MarketingFooter";
import { Hero } from "@/components/landing/Hero";
import { DemoSection } from "@/components/landing/DemoSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhatItCatches } from "@/components/landing/WhatItCatches";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { PricingSection } from "@/components/landing/PricingSection";
import { TechStackBand } from "@/components/landing/TechStackBand";
import { FooterCTA } from "@/components/landing/FooterCTA";

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      <MarketingNav />
      <Hero />
      <DemoSection />
      <HowItWorksSection />
      <WhatItCatches />
      <BeforeAfter />
      <PricingSection />
      <TechStackBand />
      <FooterCTA />
      <MarketingFooter />
    </div>
  );
}

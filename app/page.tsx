import { CtaBand } from "@/components/sections/home/cta-band";
import { Hero } from "@/components/sections/home/hero";
import { Process } from "@/components/sections/home/process";
import { ServicesPricing } from "@/components/sections/home/services-pricing";
import { Stats } from "@/components/sections/home/stats";
import { Testimonials } from "@/components/sections/home/testimonials";
import { WorkShowcase } from "@/components/sections/home/work-showcase";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WorkShowcase />
      <ServicesPricing />
      <Process />
      <Stats />
      <Testimonials />
      <CtaBand />
    </>
  );
}

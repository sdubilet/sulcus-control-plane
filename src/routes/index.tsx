import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/site/Navigation";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { Approach } from "@/components/site/Approach";
import { Architecture } from "@/components/site/Architecture";
import { Coordination } from "@/components/site/Coordination";
import { Product } from "@/components/site/Product";
import { CodeDemo } from "@/components/site/CodeDemo";
import { WhyNow } from "@/components/site/WhyNow";
import { Market } from "@/components/site/Market";
import { Compare } from "@/components/site/Compare";
import { Moat } from "@/components/site/Moat";
import { BusinessModel } from "@/components/site/BusinessModel";
import { Customers } from "@/components/site/Customers";
import { FlagshipDemo } from "@/components/site/FlagshipDemo";
import { Vision } from "@/components/site/Vision";
import { Team } from "@/components/site/Team";
import { InvestorCTA } from "@/components/site/InvestorCTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Sulcus — The control layer for autonomous AI" },
      {
        name: "description",
        content:
          "Sulcus provides the infrastructure to supervise, coordinate, observe, and control AI-agent systems in production.",
      },
      { property: "og:title", content: "Sulcus — The control layer for autonomous AI" },
      {
        property: "og:description",
        content:
          "Sulcus provides the infrastructure to supervise, coordinate, observe, and control AI-agent systems in production.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://sulcus.dev/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Sulcus",
          url: "https://sulcus.dev",
          sameAs: [],
          contactPoint: [
            { "@type": "ContactPoint", email: "sofiia@sulcus.dev", contactType: "investor relations" },
          ],
        }),
      },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <Hero />
        <Problem />
        <Approach />
        <Architecture />
        <Coordination />
        <Product />
        <CodeDemo />
        <WhyNow />
        <Market />
        <Compare />
        <Moat />
        <BusinessModel />
        <Customers />
        <FlagshipDemo />
        <Vision />
        <Team />
        <InvestorCTA />
      </main>
      <Footer />
    </div>
  );
}

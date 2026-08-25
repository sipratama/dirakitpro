import { IBM_Plex_Mono } from "next/font/google";
import { getCurrentUser } from "@dirakitpro/auth";
import { getPublishedCourses } from "@/features/catalog/get-published-courses";
import { PublicHeader } from "@/components/home/public-header";
import { HeroSection } from "@/components/home/hero-section";
import { BuildDiscoverySection } from "@/components/home/build-discovery-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { WhyDirakitProSection } from "@/components/home/why-dirakitpro-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { PublicFooter } from "@/components/home/public-footer";

// A Homepage-only utility face — part numbers, step codes, domain/caption
// labels in the assembly-diagram signature visual — layered on top of the
// site-wide Plus Jakarta Sans from the root layout, per DESIGN.md's "one
// family" rule for everything else. Loaded here (not in app/layout.tsx) and
// exposed only as a CSS variable on this page's own wrapper, so no other
// route is affected.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-home",
  weight: ["500"],
  subsets: ["latin"],
});

// Homepage (/) — the only place data is fetched; every section component is
// a plain, synchronous, presentational piece (matching the convention in
// app/dashboard/page.tsx) so each can be unit-tested without an RSC runtime.
// See docs/design/references/stitch/README.md for the visual references
// this was built from (reference only, not source code).
export default async function Home() {
  const user = await getCurrentUser();
  const courses = await getPublishedCourses(user?.id);

  return (
    // `contents` keeps this div out of the box tree (body's flex layout
    // still sees header/main/footer as direct children) while still scoping
    // --font-mono-home to the Homepage via normal CSS variable inheritance.
    <div className={`${ibmPlexMono.variable} contents`}>
      <PublicHeader user={user} />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <BuildDiscoverySection courses={courses} />
        <HowItWorksSection />
        <WhyDirakitProSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <PublicFooter />
    </div>
  );
}

import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Mono } from "next/font/google";
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
// labels — used by several sections below the hero. Loaded here (not
// app/layout.tsx) and exposed only as a CSS variable on this page's own
// wrapper, so no other route is affected.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-home",
  weight: ["500"],
  subsets: ["latin"],
});

// The header + hero's "Memphis Digital Workshop" faces (DESIGN.md 8.2) —
// layered on top of the site-wide Plus Jakarta Sans from the root layout,
// not replacing it. Loaded here (not in app/layout.tsx) and exposed only as
// CSS variables on this page's own wrapper, so no other route is affected.
const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: ["700", "800"],
  subsets: ["latin"],
});
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
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
    // these font variables to the Homepage via normal CSS variable inheritance.
    <div className={`${ibmPlexMono.variable} ${bricolageGrotesque.variable} ${dmSans.variable} contents`}>
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

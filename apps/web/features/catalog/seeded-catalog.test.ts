import { seed } from "@dirakitpro/database";
import { beforeAll, describe, expect, it } from "vitest";
import { getActiveBundles } from "./get-active-bundles";
import { getPublishedCourses } from "./get-published-courses";

// This is the Fase 3 verification step: prove the seeded Appendix A catalog
// actually surfaces through the same query functions the /courses and
// /bundles pages call — not just that the insert succeeded. `seed()` is
// idempotent (checked by slug before insert), so calling it here is safe
// against the same local dev DB every other catalog integration test uses.
describe("seeded MVP catalog (Appendix A courses + example bundle campaign)", () => {
  beforeAll(async () => {
    await seed();
  });

  it("surfaces all three Appendix A courses via getPublishedCourses(), FREE course price untouched", async () => {
    const courses = await getPublishedCourses();
    const bySlug = new Map(courses.map((course) => [course.slug, course]));

    expect(bySlug.get("rakitan-pertama-personal-website")?.price).toBe("0.00"); // CAT-004
    expect(bySlug.get("rakit-aplikasi-keuangan-pribadi")?.price).toBe("149000.00");
    expect(bySlug.get("rakit-sistem-booking-bisnis")?.price).toBe("199000.00");
  });

  it("surfaces the seeded 'Paket Merdeka' CHOOSE_N bundle via getActiveBundles()", async () => {
    const bundles = await getActiveBundles();
    const bundle = bundles.find((b) => b.slug === "paket-merdeka");

    expect(bundle).toBeDefined();
    expect(bundle?.type).toBe("CHOOSE_N");
    expect(bundle?.selectionCount).toBe(2);
    expect(bundle?.status).toBe("ACTIVE");
  });
});

import type { CourseWithOwnership } from "@/features/catalog/get-published-courses";
import { CssReveal } from "@/components/home/css-reveal";
import { DiscoveryCourseCard } from "@/components/home/discovery-course-card";

const MAX_HOMEPAGE_COURSES = 3;

// CAT-001/CAT-003: `courses` is fetched once by the page (app/page.tsx) via
// the same getPublishedCourses() read-service /courses uses — no duplicated
// query logic, and this stays a plain synchronous, testable component. If
// fewer than 3 real courses exist, only the real ones render; no
// filler/placeholder cards are fabricated.
export function BuildDiscoverySection({ courses }: { courses: CourseWithOwnership[] }) {
  const featured = courses.slice(0, MAX_HOMEPAGE_COURSES);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <h2 className="text-h1 text-brand-ink">Mau merakit apa?</h2>
      <p className="mt-2 text-body-lg text-neutral-600">
        Pilih rakitan pertamamu — setiap course berakhir dengan sesuatu yang nyata untuk ditunjukkan.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((course, index) => (
          <CssReveal key={course.id} delayMs={index * 80} className="h-full">
            <DiscoveryCourseCard course={course} />
          </CssReveal>
        ))}
      </div>
    </section>
  );
}

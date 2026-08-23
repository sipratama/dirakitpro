import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCourseBySlug } from "@/features/catalog/get-course-by-slug";
import { getCourseCurriculumSummary } from "@/features/catalog/get-course-curriculum-summary";
import { formatPrice } from "@/lib/format-price";

// SCREEN_INVENTORY /courses/[slug] CTA rule — exact copy/href per ownership:
//  - owned          -> "Lanjut Merakit" -> /learn/[slug]
//  - not owned/guest -> "Mulai Merakit" -> /checkout/course/[slug]
function courseCta(slug: string, isOwned: boolean) {
  return isOwned
    ? { label: "Lanjut Merakit", href: `/learn/${slug}` }
    : { label: "Mulai Merakit", href: `/checkout/course/${slug}` };
}

export default async function CourseDetailPage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const user = await getCurrentUser();

  // Not found / not published (CAT-003): a nonexistent or non-PUBLISHED slug is
  // a real 404, not a blank page — getCourseBySlug already only resolves
  // PUBLISHED courses.
  const course = await getCourseBySlug(slug, user?.id);
  if (!course) notFound();

  const curriculum = await getCourseCurriculumSummary(course.id);
  const cta = courseCta(course.slug, course.isOwned);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <section className="flex flex-col gap-4">
        <h1 className="text-h1 text-brand-ink">{course.title}</h1>
        <p className="text-body-lg text-neutral-600">{course.outcomeDescription}</p>
        <div className="flex items-center gap-4">
          <span className="text-h2 text-brand-ink">{formatPrice(course.price)}</span>
          <Button render={<Link href={cta.href} />}>{cta.label}</Button>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-h2 text-brand-ink">Apa yang akan kamu bangun</h2>
        <p className="mt-2 text-body text-neutral-600">{course.outcomeDescription}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-h2 text-brand-ink">Apa yang akan kamu pelajari</h2>
        <p className="mt-2 text-body text-neutral-600">{course.description}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-h2 text-brand-ink">Curriculum</h2>
        <ol className="mt-4 flex flex-col gap-5">
          {curriculum.map((stage) => (
            <li key={stage.id}>
              <h3 className="text-h3 text-brand-ink">{stage.title}</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {stage.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-2 text-body text-neutral-600">
                    <span className="text-micro text-neutral-300 uppercase">{lesson.type}</span>
                    <span>{lesson.title}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {course.difficulty && (
        <section className="mt-10">
          <h2 className="text-h2 text-brand-ink">Requirements</h2>
          <p className="mt-2 text-body text-neutral-600">Level: {course.difficulty}</p>
        </section>
      )}

      <div className="mt-10 border-t border-neutral-100 pt-8">
        <Button render={<Link href={cta.href} />}>{cta.label}</Button>
      </div>
    </div>
  );
}

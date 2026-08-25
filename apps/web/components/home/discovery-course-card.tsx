import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import type { CourseWithOwnership } from "@/features/catalog/get-published-courses";

// Homepage-specific presentation: unlike the compact catalog grid card
// (components/catalog/course-card.tsx), this leads with the real
// `thumbnailUrl` when present so "what you'll build" reads before price —
// per the Build Discovery section's brief. Falls back to a plain token-based
// block (never a stock photo) when a course has no thumbnail set.
export function DiscoveryCourseCard({ course }: { course: CourseWithOwnership }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-neutral-100 bg-surface transition-colors hover:border-brand-amber focus-visible:border-brand-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
    >
      {course.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- course thumbnails are user/admin-uploaded R2 URLs, not static app assets
        <img
          src={course.thumbnailUrl}
          alt=""
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-brand-amber-tint">
          <span className="text-h2 text-brand-amber-text">{course.title.charAt(0)}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-h3 text-brand-ink">{course.title}</h3>
        <p className="text-body text-neutral-600">{course.outcomeDescription}</p>
        <div className="flex items-center gap-3 text-small text-neutral-600">
          {course.difficulty && <span>{course.difficulty}</span>}
          {course.durationEstimate && <span>{course.durationEstimate}</span>}
        </div>
        <span className="mt-auto pt-2 text-body font-medium text-brand-ink">
          {formatPrice(course.price)}
        </span>
      </div>
    </Link>
  );
}

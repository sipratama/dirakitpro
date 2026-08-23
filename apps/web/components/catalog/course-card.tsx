import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import type { CourseWithOwnership } from "@/features/catalog/get-published-courses";

// DESIGN.md 5.4 card anatomy + 5.3 category tag. The tag text is a static
// "Rakitan pertama" label rather than a stored field: courses have no
// `category` column, and per DESIGN.md 2.3 there's only one active product
// tier (Build) in MVP, so every course card shows the same tag for now.
export function CourseCard({ course }: { course: CourseWithOwnership }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex flex-col gap-3 rounded-card border border-neutral-100 bg-surface p-5 transition-colors hover:border-brand-amber"
    >
      <span className="w-fit rounded-full bg-brand-amber-tint px-3 py-1 text-micro text-brand-amber-text">
        Rakitan pertama
      </span>
      <h3 className="text-h3 text-brand-ink">{course.title}</h3>
      <p className="text-body text-neutral-600">{course.outcomeDescription}</p>
      <div className="flex items-center gap-3 text-small text-neutral-600">
        {course.difficulty && <span>{course.difficulty}</span>}
        {course.durationEstimate && <span>{course.durationEstimate}</span>}
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-body font-medium text-brand-ink">{formatPrice(course.price)}</span>
        {course.isOwned && (
          <span className="rounded-full bg-success-bg px-3 py-1 text-micro text-success-text">
            Sudah dimiliki
          </span>
        )}
      </div>
    </Link>
  );
}

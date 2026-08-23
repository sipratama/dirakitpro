"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BundleCourseWithOwnership } from "@/features/catalog/get-bundle-by-slug";

// SCREEN_INVENTORY /bundles/[slug] CHOOSE_N: eligible courses are selectable
// cards with a running counter ("N/selectionCount dipilih"); already-owned
// courses are shown but excluded from selection (10.8). Checkout CTA only
// enables once selection is exactly `selectionCount` AND the bundle itself is
// purchasable for this learner (`checkoutDisabled`, computed by the caller —
// bundle-level ACTIVE/window state and the per-learner eligible-count rule).
export function BundleCourseSelector({
  courses,
  selectionCount,
  checkoutDisabled,
  checkoutHref,
}: {
  courses: BundleCourseWithOwnership[];
  selectionCount: number;
  checkoutDisabled: boolean;
  checkoutHref: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(courseId: string, alreadyOwned: boolean) {
    if (alreadyOwned) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  }

  const canCheckout = !checkoutDisabled && selected.size === selectionCount;

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {courses.map((course) => {
          const isSelected = selected.has(course.id);
          return (
            <button
              key={course.id}
              type="button"
              disabled={course.alreadyOwned}
              aria-pressed={isSelected}
              onClick={() => toggle(course.id, course.alreadyOwned)}
              className={`rounded-card border p-4 text-left transition-colors ${
                course.alreadyOwned
                  ? "cursor-not-allowed border-neutral-100 bg-neutral-100/40 opacity-60"
                  : isSelected
                    ? "border-brand-amber bg-brand-amber-tint"
                    : "border-neutral-100 bg-surface hover:border-brand-amber"
              }`}
            >
              <p className="text-h3 text-brand-ink">{course.title}</p>
              <p className="mt-1 text-body text-neutral-600">{course.outcomeDescription}</p>
              {course.alreadyOwned && (
                <span className="mt-2 inline-block rounded-full bg-success-bg px-3 py-1 text-micro text-success-text">
                  Sudah dimiliki
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
        <span className="text-body text-neutral-600">
          {selected.size}/{selectionCount} dipilih
        </span>
        {canCheckout ? (
          <Button render={<Link href={checkoutHref} />}>Beli bundle ini</Button>
        ) : (
          <Button disabled>Beli bundle ini</Button>
        )}
      </div>
    </div>
  );
}

import { getCurrentUser } from "@dirakitpro/auth";
import { notFound, redirect } from "next/navigation";
import { SnapCheckout } from "@/components/commerce/snap-checkout";
import { getCourseBySlug } from "@/features/catalog/get-course-by-slug";
import { createCourseOrder } from "@/features/commerce/create-course-order";
import { createSnapToken } from "@/features/commerce/create-snap-token";
import { AlreadyOwnedError, CourseNotPurchasableError } from "@/features/commerce/errors";
import { formatPrice } from "@/lib/format-price";

export default async function CourseCheckoutPage({ params }: PageProps<"/checkout/course/[courseSlug]">) {
  const { courseSlug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let result;
  try {
    result = await createCourseOrder(user.id, courseSlug);
  } catch (error) {
    // COM-016: a learner who already owns this course (e.g. via a stale tab
    // or a direct URL hit) is sent straight to the course, not shown an error.
    if (error instanceof AlreadyOwnedError) redirect(`/learn/${courseSlug}`);
    if (error instanceof CourseNotPurchasableError) notFound();
    throw error;
  }

  if (result.kind === "free_enrolled") {
    // 10.4: no Order/Payment exists for a free course — redirect server-side
    // before any render so there's no flash of a checkout screen that never
    // applies.
    redirect(`/learn/${result.courseSlug}`);
  }

  const course = await getCourseBySlug(courseSlug, user.id);
  if (!course) notFound();

  const token = await createSnapToken(result.order.id);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Checkout</h1>

      <div className="mt-6 rounded-card border border-neutral-100 bg-surface p-5">
        <p className="text-h3 text-brand-ink">{course.title}</p>
        <p className="mt-1 text-body text-neutral-600">{course.outcomeDescription}</p>
        <p className="mt-4 text-h2 text-brand-ink">{formatPrice(course.price)}</p>
      </div>

      <div className="mt-8">
        <SnapCheckout
          token={token}
          orderId={result.order.id}
          clientKey={process.env.MIDTRANS_CLIENT_KEY ?? ""}
          isProduction={process.env.MIDTRANS_IS_PRODUCTION === "true"}
        />
      </div>
    </div>
  );
}

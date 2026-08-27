import { getCurrentUser } from "@dirakitpro/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BuildProgressBar } from "@/components/learning/build-progress-bar";
import { Button } from "@/components/ui/button";
import { getDashboardCourses } from "@/features/learning/get-dashboard-courses";

// LEARNING_WORKSPACE.md §1.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dashboardCourses = await getDashboardCourses(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Dashboard</h1>

      {dashboardCourses.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-card border border-neutral-100 bg-surface p-6">
          <p className="text-body text-neutral-600">Kamu belum punya course aktif.</p>
          <Button nativeButton={false} render={<Link href="/courses" />}>
            Lihat katalog course
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {dashboardCourses.map((course) => (
            <div
              key={course.courseId}
              className="flex flex-col gap-3 rounded-card border border-neutral-100 bg-surface p-5"
            >
              <h2 className="text-h3 text-brand-ink">{course.courseTitle}</h2>
              <BuildProgressBar ratio={course.buildProgress.ratio} />
              {course.currentStageName && (
                <p className="text-small text-neutral-600">Stage saat ini: {course.currentStageName}</p>
              )}
              {course.resumeLessonSlug && (
                <Button
                  nativeButton={false}
                  render={<Link href={`/learn/${course.courseSlug}/${course.resumeLessonSlug}`} />}
                >
                  Lanjut Merakit
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

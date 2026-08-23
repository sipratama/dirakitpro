import { getCurrentUser } from "@dirakitpro/auth";
import { CourseCard } from "@/components/catalog/course-card";
import { getPublishedCourses } from "@/features/catalog/get-published-courses";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  const courses = await getPublishedCourses(user?.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Course</h1>

      {courses.length === 0 ? (
        // SCREEN_INVENTORY /courses empty state: no PUBLISHED course yet is a
        // calm, normal state — not an error.
        <p className="mt-10 text-body text-neutral-600">
          Belum ada course yang tersedia saat ini. Cek lagi nanti.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

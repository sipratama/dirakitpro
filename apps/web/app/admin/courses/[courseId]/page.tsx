import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCourseForAdmin } from "@/features/admin/get-course-for-admin";
import { CourseFormFields } from "../course-form-fields";
import { serializeResourceLines } from "../parse-course-form";
import { publishCourseAction, unpublishCourseAction, updateCourseAction } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished",
};

export default async function AdminCourseDetailPage({ params }: PageProps<"/admin/courses/[courseId]">) {
  const { courseId } = await params;
  const course = await getCourseForAdmin(courseId);
  if (!course) notFound();

  const saveAction = updateCourseAction.bind(null, courseId);
  const publishAction = publishCourseAction.bind(null, courseId);
  const unpublishAction = unpublishCourseAction.bind(null, courseId);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-brand-ink">{course.title}</h1>
        <span className="text-small text-neutral-600">{STATUS_LABEL[course.status]}</span>
      </div>

      <form action={saveAction} className="mt-8 flex flex-col gap-5">
        <CourseFormFields
          defaults={{
            slug: course.slug,
            title: course.title,
            outcomeDescription: course.outcomeDescription,
            description: course.description,
            difficulty: course.difficulty ?? "",
            durationEstimate: course.durationEstimate ?? "",
            thumbnailUrl: course.thumbnailUrl ?? "",
            price: course.price,
            currency: course.currency,
            resources: serializeResourceLines(course.resources),
          }}
        />
        <Button type="submit">Simpan</Button>
      </form>

      <div className="mt-10 border-t border-neutral-100 pt-6">
        <h2 className="text-h3 text-brand-ink">Publishing</h2>
        <p className="mt-1 text-small text-neutral-600">
          Mengubah course dari PUBLISHED ke UNPUBLISHED menghentikan discovery dan pembelian baru, tapi tidak mencabut
          akses learner yang sudah enroll (CAT-003/LRN-006).
        </p>

        {course.status === "PUBLISHED" ? (
          <form action={unpublishAction} className="mt-4">
            <Button type="submit" variant="outline">
              Unpublish
            </Button>
          </form>
        ) : (
          <form action={publishAction} className="mt-4">
            <Button type="submit">Publish</Button>
          </form>
        )}
      </div>
    </div>
  );
}

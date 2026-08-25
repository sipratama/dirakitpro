import { Button } from "@/components/ui/button";
import { CourseFormFields, EMPTY_COURSE_FORM_DEFAULTS } from "../course-form-fields";
import { createCourseAction } from "./actions";

export default function NewCoursePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Course baru</h1>

      <form action={createCourseAction} className="mt-8 flex flex-col gap-5">
        <CourseFormFields defaults={EMPTY_COURSE_FORM_DEFAULTS} />
        <Button type="submit">Simpan sebagai draft</Button>
      </form>
    </div>
  );
}

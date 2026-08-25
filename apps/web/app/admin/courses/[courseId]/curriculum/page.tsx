import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCourseForAdmin } from "@/features/admin/get-course-for-admin";
import { getCurriculumForAdmin, type AdminLesson, type AdminMilestone, type AdminStage } from "@/features/admin/get-curriculum-for-admin";
import {
  addBuildMilestoneAction,
  addCourseStageAction,
  addLessonAction,
  deleteBuildMilestoneAction,
  deleteCourseStageAction,
  deleteLessonAction,
  moveBuildMilestoneAction,
  moveCourseStageAction,
  moveLessonAction,
  updateBuildMilestoneAction,
  updateCourseStageAction,
  updateLessonMetadataAction,
} from "./actions";

const inputClass =
  "w-full rounded-control border border-neutral-300 bg-surface px-3 py-2 text-body text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal";

const LESSON_TYPES: AdminLesson["type"][] = ["CONCEPT", "DEMO", "BUILD", "CHECKPOINT", "DEPLOY"];

function LessonRow({
  courseId,
  stageId,
  lesson,
  milestones,
}: {
  courseId: string;
  stageId: string;
  lesson: AdminLesson;
  milestones: AdminMilestone[];
}) {
  const saveAction = updateLessonMetadataAction.bind(null, courseId, lesson.id);
  const deleteAction = deleteLessonAction.bind(null, courseId, lesson.id);
  const moveUpAction = moveLessonAction.bind(null, courseId, stageId, lesson.id, "up");
  const moveDownAction = moveLessonAction.bind(null, courseId, stageId, lesson.id, "down");

  return (
    <li className="rounded-control border border-neutral-100 p-3">
      <form action={saveAction} className="flex flex-wrap items-end gap-2">
        <input name="title" defaultValue={lesson.title} placeholder="Judul" required className={`${inputClass} w-40`} />
        <input name="slug" defaultValue={lesson.slug} placeholder="Slug" required className={`${inputClass} w-32`} />
        <select name="type" defaultValue={lesson.type} className={`${inputClass} w-32`}>
          {LESSON_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select name="buildMilestoneId" defaultValue={lesson.buildMilestoneId ?? ""} className={`${inputClass} w-40`}>
          <option value="">Tidak ada milestone</option>
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-small text-brand-ink">
          <input type="checkbox" name="isRequired" defaultChecked={lesson.isRequired} />
          Required
        </label>
        <Button type="submit" size="sm">
          Simpan
        </Button>
      </form>

      <div className="mt-2 flex items-center gap-2">
        <form action={moveUpAction}>
          <Button type="submit" variant="outline" size="sm">
            ↑
          </Button>
        </form>
        <form action={moveDownAction}>
          <Button type="submit" variant="outline" size="sm">
            ↓
          </Button>
        </form>
        <Link
          href={`/admin/courses/${courseId}/curriculum/lessons/${lesson.id}`}
          className="text-small text-brand-ink underline"
        >
          Edit content →
        </Link>
        <form action={deleteAction}>
          <Button type="submit" variant="destructive" size="sm">
            Hapus
          </Button>
        </form>
      </div>
    </li>
  );
}

function StageSection({
  courseId,
  stage,
  milestones,
}: {
  courseId: string;
  stage: AdminStage;
  milestones: AdminMilestone[];
}) {
  const saveAction = updateCourseStageAction.bind(null, courseId, stage.id);
  const deleteAction = deleteCourseStageAction.bind(null, courseId, stage.id);
  const moveUpAction = moveCourseStageAction.bind(null, courseId, stage.id, "up");
  const moveDownAction = moveCourseStageAction.bind(null, courseId, stage.id, "down");
  const addLesson = addLessonAction.bind(null, courseId, stage.id);

  return (
    <div className="rounded-card border border-neutral-100 p-5">
      <div className="flex flex-wrap items-end gap-2">
        <form action={saveAction} className="flex items-end gap-2">
          <input name="title" defaultValue={stage.title} required className={`${inputClass} w-56`} />
          <Button type="submit" size="sm">
            Simpan
          </Button>
        </form>
        <form action={moveUpAction}>
          <Button type="submit" variant="outline" size="sm">
            ↑
          </Button>
        </form>
        <form action={moveDownAction}>
          <Button type="submit" variant="outline" size="sm">
            ↓
          </Button>
        </form>
        <form action={deleteAction}>
          <Button type="submit" variant="destructive" size="sm">
            Hapus stage
          </Button>
        </form>
      </div>

      {stage.lessons.length === 0 ? (
        <p className="mt-4 text-small text-neutral-600">Belum ada lesson di stage ini.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {stage.lessons.map((lesson) => (
            <LessonRow key={lesson.id} courseId={courseId} stageId={stage.id} lesson={lesson} milestones={milestones} />
          ))}
        </ul>
      )}

      <form action={addLesson} className="mt-4 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-4">
        <input name="title" placeholder="Judul lesson baru" required className={`${inputClass} w-40`} />
        <input name="slug" placeholder="Slug" required className={`${inputClass} w-32`} />
        <select name="type" defaultValue="CONCEPT" className={`${inputClass} w-32`}>
          {LESSON_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select name="buildMilestoneId" defaultValue="" className={`${inputClass} w-40`}>
          <option value="">Tidak ada milestone</option>
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-small text-brand-ink">
          <input type="checkbox" name="isRequired" defaultChecked />
          Required
        </label>
        <Button type="submit" variant="outline" size="sm">
          + Tambah lesson
        </Button>
      </form>
    </div>
  );
}

function MilestoneRow({ courseId, milestone }: { courseId: string; milestone: AdminMilestone }) {
  const saveAction = updateBuildMilestoneAction.bind(null, courseId, milestone.id);
  const deleteAction = deleteBuildMilestoneAction.bind(null, courseId, milestone.id);
  const moveUpAction = moveBuildMilestoneAction.bind(null, courseId, milestone.id, "up");
  const moveDownAction = moveBuildMilestoneAction.bind(null, courseId, milestone.id, "down");

  return (
    <li className="flex flex-wrap items-end gap-2 rounded-control border border-neutral-100 p-3">
      <form action={saveAction} className="flex items-end gap-2">
        <input name="title" defaultValue={milestone.title} required className={`${inputClass} w-56`} />
        <label className="flex items-center gap-1 text-small text-brand-ink">
          <input type="checkbox" name="isRequired" defaultChecked={milestone.isRequired} />
          Required
        </label>
        <Button type="submit" size="sm">
          Simpan
        </Button>
      </form>
      <form action={moveUpAction}>
        <Button type="submit" variant="outline" size="sm">
          ↑
        </Button>
      </form>
      <form action={moveDownAction}>
        <Button type="submit" variant="outline" size="sm">
          ↓
        </Button>
      </form>
      <form action={deleteAction}>
        <Button type="submit" variant="destructive" size="sm">
          Hapus
        </Button>
      </form>
    </li>
  );
}

// ADM-003/CURRICULUM_MANAGEMENT.md §4 — milestone existence/metadata only,
// never a "mark complete" action (BLD-002's derivation from CHECKPOINT
// lesson completion is unchanged by this wave).
function MilestoneSection({ courseId, milestones }: { courseId: string; milestones: AdminMilestone[] }) {
  const addAction = addBuildMilestoneAction.bind(null, courseId);

  return (
    <div className="rounded-card border border-neutral-100 p-5">
      <h2 className="text-h3 text-brand-ink">Milestones</h2>

      {milestones.length === 0 ? (
        <p className="mt-4 text-small text-neutral-600">Belum ada milestone.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {milestones.map((milestone) => (
            <MilestoneRow key={milestone.id} courseId={courseId} milestone={milestone} />
          ))}
        </ul>
      )}

      <form action={addAction} className="mt-4 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-4">
        <input name="title" placeholder="Judul milestone baru" required className={`${inputClass} w-56`} />
        <label className="flex items-center gap-1 text-small text-brand-ink">
          <input type="checkbox" name="isRequired" defaultChecked />
          Required
        </label>
        <Button type="submit" variant="outline" size="sm">
          + Tambah milestone
        </Button>
      </form>
    </div>
  );
}

export default async function AdminCurriculumPage({ params }: PageProps<"/admin/courses/[courseId]/curriculum">) {
  const { courseId } = await params;
  const course = await getCourseForAdmin(courseId);
  if (!course) notFound();

  const { stages, milestones } = await getCurriculumForAdmin(courseId);
  const addStageAction = addCourseStageAction.bind(null, courseId);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="text-small text-neutral-600">
        <Link href={`/admin/courses/${courseId}`} className="underline">
          ← {course.title}
        </Link>
      </p>
      <h1 className="mt-1 text-h1 text-brand-ink">Curriculum</h1>

      {stages.length === 0 ? (
        <p className="mt-6 text-body text-neutral-600">Belum ada stage.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {stages.map((stage) => (
            <StageSection key={stage.id} courseId={courseId} stage={stage} milestones={milestones} />
          ))}
        </div>
      )}

      <form action={addStageAction} className="mt-8 flex items-end gap-2 border-t border-neutral-100 pt-6">
        <input name="title" placeholder="Judul stage baru" required className={`${inputClass} w-56`} />
        <Button type="submit">+ Tambah stage</Button>
      </form>

      <div className="mt-10">
        <MilestoneSection courseId={courseId} milestones={milestones} />
      </div>
    </div>
  );
}

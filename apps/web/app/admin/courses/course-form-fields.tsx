const inputClass =
  "w-full rounded-control border border-neutral-300 bg-surface px-3 py-2 text-body text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal";

export type CourseFormDefaults = {
  slug: string;
  title: string;
  outcomeDescription: string;
  description: string;
  difficulty: string;
  durationEstimate: string;
  thumbnailUrl: string;
  price: string;
  currency: string;
  resources: string;
};

export const EMPTY_COURSE_FORM_DEFAULTS: CourseFormDefaults = {
  slug: "",
  title: "",
  outcomeDescription: "",
  description: "",
  difficulty: "",
  durationEstimate: "",
  thumbnailUrl: "",
  price: "0",
  currency: "IDR",
  resources: "",
};

/** Shared field set for /admin/courses/new and /admin/courses/[courseId] — same fields, same layout, different defaults/action. */
export function CourseFormFields({ defaults }: { defaults: CourseFormDefaults }) {
  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">Slug *</span>
        <input name="slug" defaultValue={defaults.slug} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">Judul *</span>
        <input name="title" defaultValue={defaults.title} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">Outcome description *</span>
        <textarea name="outcomeDescription" defaultValue={defaults.outcomeDescription} rows={2} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">Deskripsi *</span>
        <textarea name="description" defaultValue={defaults.description} rows={3} required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">Difficulty</span>
        <input name="difficulty" defaultValue={defaults.difficulty} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">Estimasi durasi</span>
        <input name="durationEstimate" defaultValue={defaults.durationEstimate} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">Thumbnail URL</span>
        <input name="thumbnailUrl" defaultValue={defaults.thumbnailUrl} className={inputClass} />
      </label>
      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Harga * (0 = FREE)</span>
          <input name="price" defaultValue={defaults.price} required className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Currency</span>
          <input name="currency" defaultValue={defaults.currency} className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">Resources (satu per baris, format: Label | https://...)</span>
        <textarea name="resources" defaultValue={defaults.resources} rows={3} className={inputClass} />
      </label>
    </>
  );
}

const inputClass =
  "w-full rounded-control border border-neutral-300 bg-surface px-3 py-2 text-body text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal";

export type BundleFormDefaults = {
  slug: string;
  title: string;
  description: string;
  type: "FIXED" | "CHOOSE_N";
  selectionCount: string;
  price: string;
  currency: string;
  startsAt: string;
  endsAt: string;
};

export const EMPTY_BUNDLE_FORM_DEFAULTS: BundleFormDefaults = {
  slug: "",
  title: "",
  description: "",
  type: "FIXED",
  selectionCount: "",
  price: "0",
  currency: "IDR",
  startsAt: "",
  endsAt: "",
};

/** Shared field set for /admin/bundles/new and /admin/bundles/[bundleId] — same fields, same layout, different defaults/action. `typeLocked` disables the type radios once the bundle has ever been ACTIVE (BundleTypeLockedError). */
export function BundleFormFields({ defaults, typeLocked }: { defaults: BundleFormDefaults; typeLocked: boolean }) {
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
        <span className="text-small font-medium text-brand-ink">Deskripsi *</span>
        <textarea name="description" defaultValue={defaults.description} rows={3} required className={inputClass} />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-small font-medium text-brand-ink">Type *</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-body text-brand-ink">
            <input type="radio" name="type" value="FIXED" defaultChecked={defaults.type === "FIXED"} disabled={typeLocked} />
            FIXED
          </label>
          <label className="flex items-center gap-2 text-body text-brand-ink">
            <input type="radio" name="type" value="CHOOSE_N" defaultChecked={defaults.type === "CHOOSE_N"} disabled={typeLocked} />
            CHOOSE_N
          </label>
        </div>
        {typeLocked && (
          <p className="text-micro text-neutral-600">Type terkunci — bundle ini pernah ACTIVE.</p>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-small font-medium text-brand-ink">selectionCount (N, wajib untuk CHOOSE_N)</span>
        <input name="selectionCount" defaultValue={defaults.selectionCount} className={inputClass} />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Harga bundle *</span>
          <input name="price" defaultValue={defaults.price} required className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Currency</span>
          <input name="currency" defaultValue={defaults.currency} className={inputClass} />
        </label>
      </div>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Mulai (opsional)</span>
          <input type="datetime-local" name="startsAt" defaultValue={defaults.startsAt} className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-small font-medium text-brand-ink">Berakhir (opsional)</span>
          <input type="datetime-local" name="endsAt" defaultValue={defaults.endsAt} className={inputClass} />
        </label>
      </div>
    </>
  );
}

// Handcrafted per-course miniature product previews for Build Discovery
// (VISUAL_POLISH V2.1, Phase 8) — replaces the old generic "preview belum
// tersedia" placeholder block. Priority order lives in the caller
// (discovery-course-card.tsx): real `thumbnailUrl` first, then this.
//
// Each of the three seeded MVP courses (packages/database/src/seed.ts) gets
// a DIFFERENT small product mockup so the grid reads as three distinct
// things being built, not three identical dashboard cards. An unrecognized
// future course slug still gets a branded (not text-placeholder) fallback.
// Memphis intensity here is intentionally lower than the Hero: 1.5px ink
// outlines instead of 2px, no resting shadow (only on card hover, applied
// by the caller), muted tints instead of solid fills for most fields.
const PERSONAL_WEBSITE_SLUG = "rakitan-pertama-personal-website";
const PERSONAL_FINANCE_SLUG = "rakit-aplikasi-keuangan-pribadi";
const BOOKING_SYSTEM_SLUG = "rakit-sistem-booking-bisnis";

export function CoursePreview({ slug }: { slug: string }) {
  if (slug === PERSONAL_WEBSITE_SLUG) return <PersonalWebsitePreview />;
  if (slug === PERSONAL_FINANCE_SLUG) return <PersonalFinancePreview />;
  if (slug === BOOKING_SYSTEM_SLUG) return <BookingSystemPreview />;
  return <GenericAssemblyPreview />;
}

function PersonalWebsitePreview() {
  return (
    <div className="flex h-40 w-full flex-col justify-center gap-3 bg-neutral-50 p-4">
      <div className="overflow-hidden rounded-control border-[1.5px] border-memphis-ink bg-white">
        <div className="flex items-center gap-1 border-b border-neutral-100 px-2.5 py-1.5">
          <span className="size-1.5 rounded-full bg-memphis-coral transition-transform duration-200 group-hover:scale-125" />
          <span className="size-1.5 rounded-full bg-memphis-mustard" />
          <span className="size-1.5 rounded-full bg-memphis-teal" />
        </div>
        <div className="flex items-center gap-2 p-2.5">
          <div className="size-6 shrink-0 rounded-full bg-memphis-teal/20" />
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-brand-ink">Singgih Pratama</p>
            <p className="text-[9px] text-neutral-600">Backend & Integration Engineer</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5" aria-hidden="true">
        <span className="h-6 rounded-control bg-memphis-teal/15" />
        <span className="h-6 rounded-control bg-memphis-sky/15" />
      </div>
    </div>
  );
}

function PersonalFinancePreview() {
  return (
    <div className="flex h-40 w-full flex-col gap-3 bg-neutral-50 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] text-neutral-600">Saldo</span>
        <span className="text-sm font-bold text-brand-ink">Rp 2.450.000</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-control border-[1.5px] border-memphis-ink/15 bg-success-bg px-2 py-1.5">
          <p className="text-[8px] font-medium text-brand-teal-text">Pemasukan</p>
          <p className="text-[11px] font-bold text-brand-teal-text">Rp 3.2jt</p>
        </div>
        <div className="rounded-control border-[1.5px] border-memphis-ink/15 bg-danger-bg px-2 py-1.5">
          <p className="text-[8px] font-medium text-danger-text">Pengeluaran</p>
          <p className="text-[11px] font-bold text-danger-text">Rp 750rb</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5" aria-hidden="true">
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <span className="block h-full w-3/4 origin-left scale-x-100 rounded-full bg-memphis-teal transition-transform duration-300 group-hover:scale-x-110" />
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <span className="block h-full w-1/3 rounded-full bg-memphis-coral" />
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <span className="block h-full w-1/5 rounded-full bg-memphis-mustard" />
        </div>
      </div>
    </div>
  );
}

function BookingSystemPreview() {
  return (
    <div className="flex h-40 w-full flex-col gap-2.5 bg-neutral-50 p-4">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="rounded-control border-[1.5px] border-memphis-ink bg-white px-2 py-1 text-[8px] font-semibold text-brand-ink">
          Potong rambut
        </span>
        <span className="rounded-control border-[1.5px] border-memphis-ink/15 bg-white px-2 py-1 text-[8px] text-neutral-600">
          Facial
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {["09:00", "10:00", "11:00", "13:00"].map((slot, index) => (
          <span
            key={slot}
            className={
              index === 1
                ? "rounded-control border-[1.5px] border-memphis-ink bg-memphis-mustard px-1 py-1 text-center text-[7px] font-bold text-brand-ink transition-transform duration-200 group-hover:scale-105"
                : "rounded-control border-[1.5px] border-memphis-ink/15 bg-white px-1 py-1 text-center text-[7px] text-neutral-600"
            }
          >
            {slot}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-1.5 rounded-control bg-success-bg px-2 py-1.5">
        <span className="size-1.5 rounded-full bg-brand-teal" />
        <span className="text-[8px] font-semibold text-brand-teal-text">Booking terkonfirmasi</span>
      </div>
    </div>
  );
}

// Fallback for any course not in the three-slug map above — still a
// branded assembly-piece mark, never the old "preview belum tersedia" text
// block, so a future fourth course doesn't regress to a placeholder look.
function GenericAssemblyPreview() {
  return (
    <div className="flex h-40 w-full items-center justify-center gap-3 bg-neutral-50" aria-hidden="true">
      <span className="size-8 rounded-control border-[1.5px] border-memphis-ink bg-memphis-teal/20" />
      <span className="size-8 rotate-6 rounded-control border-[1.5px] border-memphis-ink bg-memphis-coral/20" />
      <span className="size-8 rounded-control border-[1.5px] border-memphis-ink bg-memphis-mustard/20" />
    </div>
  );
}

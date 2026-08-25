import { Check, Globe2 } from "lucide-react";
import { CssReveal } from "@/components/home/css-reveal";

// Matches the approved dirakitpro_differentiators_remediated reference
// exactly — three concepts, no more, no generic "feature card" copy.
const CONCEPTS = [
  {
    title: "Tahu apa yang akan kamu buat.",
    body: "Setiap course dimulai dari hasil akhirnya — kamu tahu persis rakitan apa yang akan berdiri di tanganmu.",
  },
  {
    title: "Lihat rakitanmu berkembang.",
    body: "Progress bukan sekadar persen selesai — setiap tahap menambahkan bagian nyata ke proyekmu.",
  },
  {
    title: "Punya sesuatu untuk ditunjukkan.",
    body: "Kamu keluar dengan karya yang bisa kamu tunjukkan, bukan hanya sertifikat.",
  },
];

function OutcomePreview() {
  return (
    <div className="flex h-full items-center justify-center bg-brand-teal-tint p-4">
      <div className="w-full overflow-hidden rounded-control border border-neutral-300 bg-surface">
        <div className="flex items-center gap-1 border-b border-neutral-100 px-3 py-2">
          <span className="size-2 rounded-full bg-brand-amber" />
          <span className="size-2 rounded-full bg-neutral-300" />
          <span className="size-2 rounded-full bg-brand-teal" />
        </div>
        <div className="flex items-center gap-3 p-3">
          <div className="size-9 rounded-full bg-brand-amber-tint" />
          <div className="flex flex-1 flex-col gap-2">
            <span className="h-2 w-3/4 rounded-full bg-brand-ink" />
            <span className="h-2 w-1/2 rounded-full bg-neutral-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-brand-amber-tint p-5">
      <div className="flex items-center justify-between text-micro font-semibold text-brand-ink">
        <span>Personal Website</span>
        <span>Sedang dirakit</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full w-2/3 rounded-full bg-brand-teal" />
      </div>
      <div className="grid grid-cols-3 gap-2" aria-hidden="true">
        <span className="h-8 rounded-control bg-brand-teal" />
        <span className="h-8 rounded-control bg-brand-amber" />
        <span className="h-8 rounded-control border border-neutral-300 bg-surface" />
      </div>
    </div>
  );
}

function PortfolioPreview() {
  return (
    <div className="flex h-full items-center justify-center bg-brand-ink p-4">
      <div className="flex w-full items-center gap-3 rounded-control border border-neutral-100 bg-surface p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-teal-tint text-brand-teal-text">
          <Globe2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-micro font-semibold text-brand-ink">
            <span className="truncate">singgihpratama.com</span>
            <Check className="size-3 shrink-0 text-brand-teal-text" />
          </div>
          <div className="mt-2 h-2 w-2/3 rounded-full bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

export function WhyDirakitProSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <h2 className="text-h1 text-brand-ink">Bukan cuma selesai belajar.</h2>

      <CssReveal className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
        {CONCEPTS.map((concept, index) => (
          <div key={concept.title} className="flex flex-col gap-3">
            <div className="relative h-32 overflow-hidden rounded-card border border-neutral-100" aria-hidden="true">
              {index === 0 ? (
                <OutcomePreview />
              ) : index === 1 ? (
                <ProgressPreview />
              ) : (
                <PortfolioPreview />
              )}
              {/* Quiet echo of the Hero signature's part markers — these
                  three concepts are themselves the "parts" of what you get
                  from building, not just watching. */}
              <span className="absolute top-2 left-2 size-1.5 rounded-full border-2 border-brand-amber bg-surface" />
            </div>
            <span className="[font-family:var(--font-mono-home)] text-micro text-neutral-600">
              C.{String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-h3 text-brand-ink">{concept.title}</h3>
            <p className="text-body text-neutral-600">{concept.body}</p>
          </div>
        ))}
      </CssReveal>
    </section>
  );
}

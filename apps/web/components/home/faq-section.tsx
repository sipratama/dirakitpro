// Native <details>/<summary> per the FAQ interaction spec — no accordion
// component exists in the repo to reuse, and no new UI dependency is added
// solely for this. <details> is natively keyboard-operable and exposes its
// own open/closed state to assistive tech without manual aria wiring, and
// needs no client JS at all, so this stays a Server Component.
//
// The Stitch draft's second answer claimed "komunitas perakit siap membantu"
// (a mentoring/community feature) — that doesn't exist in the current
// product, so this answer is reworded to describe what actually exists.
const FAQ_ITEMS = [
  {
    question: "Saya belum pernah membangun proyek nyata. Apakah ini terlalu sulit?",
    answer:
      "Setiap course dimulai dari rakitan pertama yang sederhana dan dipecah tahap demi tahap, jadi kamu tidak perlu pengalaman proyek sebelumnya untuk mulai.",
  },
  {
    question: "Kalau saya bingung di tengah jalan, bagaimana?",
    answer:
      "Setiap course punya materi dan resource pendukung di setiap tahap, jadi kamu bisa kembali mempelajari konsepnya kapan pun sebelum lanjut merakit.",
  },
  {
    question: "Apa bedanya dengan course video biasa?",
    answer:
      "Kamu tidak hanya menonton — setiap tahap berakhir dengan bagian nyata dari proyekmu yang bertambah, sampai rakitanmu selesai dan bisa ditunjukkan.",
  },
  {
    question: "Apakah saya memiliki hasil rakitannya?",
    answer: "Ya — proyek yang kamu rakit adalah milikmu, dan bisa kamu tunjukkan sebagai karya nyata.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16">
      <h2 className="text-h1 text-brand-ink">Sebelum mulai merakit.</h2>

      <style>{`
        /* Fast, controlled reveal for the answer — a CSS animation (not a
           height transition) because native <details> toggles its hidden
           content synchronously; animating opacity/transform on top of
           that is well-supported everywhere and stays snappy, not springy. */
        @keyframes dp-faq-answer-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        details[open] > .dp-faq-answer { animation: dp-faq-answer-in 180ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          details[open] > .dp-faq-answer { animation: none; }
        }
      `}</style>

      <div className="mt-8 flex flex-col divide-y divide-neutral-100 border-t border-b border-neutral-100">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body-lg font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber">
              {item.question}
              <span className="shrink-0 text-neutral-600 transition-transform duration-150 group-open:rotate-45 motion-reduce:transition-none">
                +
              </span>
            </summary>
            <p className="dp-faq-answer mt-3 text-body text-neutral-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

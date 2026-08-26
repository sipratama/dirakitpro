import type { Metadata } from "next";
import { getCurrentUser } from "@dirakitpro/auth";
import { MentoringCta } from "@/components/about/mentoring-cta";
import { PublicFooter } from "@/components/home/public-footer";
import { PublicHeader } from "@/components/home/public-header";

export const metadata: Metadata = {
  title: "Tentang | DirakitPro",
  description: "Cerita DirakitPro dan mentoring privat bersama founder.",
};

const MENTORING_PRICE_RANGE =
  // TODO: placeholder, perlu angka asli dari founder sebelum live
  "RpXXX.XXX–RpXXX.XXX per sesi";

export default async function AboutPage() {
  const user = await getCurrentUser();

  return (
    <>
      <PublicHeader user={user} />
      <main className="flex flex-1 flex-col bg-brand-cream text-brand-ink">
        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] md:items-start">
            <div className="max-w-3xl">
              <p className="mb-4 text-small font-bold text-brand-amber-text">Tentang DirakitPro</p>
              <h1 className="text-display text-brand-ink">Profesional itu dirakit.</h1>
              <div className="mt-6 space-y-4 text-body-lg text-neutral-600">
                <p>
                  Profesional bukan label yang muncul dalam semalam. Ia dirakit dari langkah kecil yang selesai,
                  pemahaman yang tumbuh, dan hasil nyata yang bisa kamu tunjukkan.
                </p>
                <p>
                  Nama DirakitPro menyatukan proses dan tujuannya: kemampuan profesional tidak diberikan dalam
                  bentuk instan, tetapi dirakit lewat pekerjaan yang kamu pahami dan selesaikan. Bukan sekadar
                  menonton sampai habis, tetapi melihat progress lalu membuktikannya lewat rakitanmu sendiri.
                </p>
                <p>
                  Perjalanannya bisa berlanjut dari Build menuju Understand, Engineer, Production, lalu Scale. Untuk
                  MVP saat ini, hanya Build — Rakitan Pertama — yang aktif. Tahap setelahnya adalah arah jangka
                  panjang, bukan course yang sudah tersedia.
                </p>
              </div>
            </div>

            <div className="grid gap-4" aria-label="Makna PRO">
              {[
                ["Professional", "Cara kerja yang rapi, bertanggung jawab, dan terus bertumbuh."],
                ["Progress", "Kemajuan yang terlihat dari satu tahap selesai ke tahap berikutnya."],
                ["Proven", "Bukti nyata berupa hasil rakitan yang bisa digunakan dan ditunjukkan."],
              ].map(([title, description]) => (
                <article key={title} className="rounded-card border border-neutral-100 bg-white p-5">
                  <h2 className="text-h3 text-brand-ink">{title}</h2>
                  <p className="mt-2 text-body text-neutral-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-100 bg-white px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 text-small font-bold text-brand-teal-text">Mentoring privat</p>
              <h2 className="text-h1 text-brand-ink">Bahas rakitanmu langsung bersama founder.</h2>
              <p className="mt-4 text-body-lg text-neutral-600">
                Sesi privat untuk membedah hambatan, menata langkah berikutnya, dan mendapat masukan langsung pada
                rakitan yang sedang kamu kerjakan. Jadwal dan kelanjutannya dibicarakan melalui layanan eksternal.
              </p>
              <p className="mt-6 text-small text-neutral-600">Kisaran harga indikatif</p>
              <p className="mt-1 text-h3 text-brand-ink">{MENTORING_PRICE_RANGE}</p>
            </div>

            <MentoringCta />
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

import "server-only";
import { courses, db, users } from "@dirakitpro/database";
import { sendEmail } from "@dirakitpro/email";
import { eq, inArray } from "drizzle-orm";

/**
 * NTF-001/NTF-003: exactly one payment-success email per Order, regardless of
 * source type — a DIRECT_COURSE order's single grant, or a BUNDLE order's N
 * grants, both produce exactly ONE call to sendEmail() listing every granted
 * course, never one email per course.
 *
 * Callers (the webhook route) must call this AFTER the Order/Payment
 * transaction has already committed, and must wrap it so a delivery failure
 * never affects the response back to Midtrans (NTF-002) — this function does
 * not swallow its own errors, that's the caller's responsibility.
 */
export async function sendPaymentSuccessEmail(userId: string, grantedCourseIds: string[]): Promise<void> {
  if (grantedCourseIds.length === 0) return;

  const [buyer] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!buyer) return;

  const grantedCourses = await db
    .select({ title: courses.title })
    .from(courses)
    .where(inArray(courses.id, grantedCourseIds));
  const courseListHtml = grantedCourses.map((course) => `<li>${course.title}</li>`).join("");

  await sendEmail({
    to: buyer.email,
    subject: grantedCourses.length > 1 ? "Pembayaran berhasil — course kamu sudah aktif" : "Pembayaran berhasil",
    html: `<p>Halo ${buyer.displayName},</p><p>Pembayaran kamu berhasil. Course berikut sudah aktif di akunmu:</p><ul>${courseListHtml}</ul>`,
  });
}

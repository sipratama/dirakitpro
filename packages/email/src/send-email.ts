export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

/**
 * TODO(email): Resend is not wired up yet in this repository — no
 * `RESEND_API_KEY` configured, no React Email templates. This stub exists so
 * domain code (e.g. commerce's payment-success email, NTF-001/NTF-002/NTF-003)
 * has a stable interface to call NOW instead of being blocked on Resend setup.
 * Replace this body with an actual Resend `send()` call once that setup
 * happens — callers already treat a rejected promise as a real delivery
 * failure (NTF-002: must never fail the caller's own transaction/response),
 * so swap the implementation without changing any call site.
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  console.warn("[email:stub] sendEmail() called but Resend is not configured yet.", {
    to: params.to,
    subject: params.subject,
  });
}

import { clerkMiddleware } from "@clerk/nextjs/server";

// PRD 12.2 (learner) + 12.3 (commerce/admin), minus the Midtrans webhook
// (IAM-002 acceptance: those routes require a valid server-side session).
//
// Clerk deprecates `createRouteMatcher` in favor of per-page/resource checks —
// "middleware-based auth checks rely on path matching, which can diverge from
// how Next.js routes requests and leave protected resources reachable." So this
// list intentionally only covers prefixes that no public route (12.1) shares.
//
// `/projects/me` and `/projects/me/[projectId]` (12.2, learner-only) sit under the
// same `/projects` prefix as the public gallery (`/projects`) and public showcase
// (`/projects/[username]/[slug]`) routes — gating that prefix here would either
// wrongly protect the public showcase or wrongly expose the learner pages.
// Those two routes are NOT gated here; they must call getCurrentUser() themselves
// once they're built (Project domain, a later phase) — see summary notes.
const PROTECTED_PREFIXES = ["/dashboard", "/learn", "/account", "/checkout", "/payment", "/admin"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedPath(request.nextUrl.pathname)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

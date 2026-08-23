import "server-only";
import type { User } from "@dirakitpro/database";
import { AuthenticationError, ForbiddenError } from "./errors";
import { getCurrentUser } from "./get-current-user";

/**
 * Server-side admin gate (ADM-001, PRD 16). Call this at the top of every admin
 * route/action/mutation — never rely on hiding UI as the only protection.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError();
  }
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Admin role required");
  }
  return user;
}

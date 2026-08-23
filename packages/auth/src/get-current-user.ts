import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { authIdentities, db, users, type User } from "@dirakitpro/database";
import { and, eq } from "drizzle-orm";

const CLERK_PROVIDER = "clerk";
const MAX_USERNAME_ATTEMPTS = 5;

function isUniqueViolation(error: unknown, constraint: string): boolean {
  // drizzle-orm wraps the raw pg error (which carries .code/.constraint) in its
  // own error type with a `.cause` — check both, since which one holds the
  // fields depends on the driver/version.
  for (const candidate of [error, (error as { cause?: unknown } | null)?.cause]) {
    if (
      typeof candidate === "object" &&
      candidate !== null &&
      (candidate as { code?: string }).code === "23505" &&
      (candidate as { constraint?: string }).constraint === constraint
    ) {
      return true;
    }
  }
  return false;
}

function deriveBaseUsername(email: string, clerkUsername: string | null): string {
  const source = clerkUsername ?? email.split("@")[0] ?? "learner";
  const normalized = source.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return normalized.length > 0 ? normalized.slice(0, 56) : "learner";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

async function findUserByProviderIdentity(
  provider: string,
  providerUserId: string,
): Promise<User | null> {
  const rows = await db
    .select({ user: users })
    .from(authIdentities)
    .innerJoin(users, eq(authIdentities.userId, users.id))
    .where(and(eq(authIdentities.provider, provider), eq(authIdentities.providerUserId, providerUserId)))
    .limit(1);

  return rows[0]?.user ?? null;
}

async function provisionUser(provider: string, providerUserId: string): Promise<User> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Clerk session is active but the user profile could not be loaded");
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("Clerk user has no email address");
  }

  const displayName = clerkUser.fullName ?? email.split("@")[0] ?? "Learner";
  const baseUsername = deriveBaseUsername(email, clerkUser.username);

  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt++) {
    const username = attempt === 0 ? baseUsername : `${baseUsername}-${randomSuffix()}`;

    try {
      return await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({
            email,
            username,
            displayName,
            avatarUrl: clerkUser.imageUrl ?? null,
            role: "LEARNER",
          })
          .returning();

        await tx.insert(authIdentities).values({
          userId: user.id,
          provider,
          providerUserId,
        });

        return user;
      });
    } catch (error) {
      if (isUniqueViolation(error, "auth_identities_provider_provider_user_id_idx")) {
        // A concurrent call already provisioned this identity — read what it created
        // instead of erroring, so getCurrentUser() stays idempotent under races.
        const existing = await findUserByProviderIdentity(provider, providerUserId);
        if (existing) return existing;
        continue;
      }
      if (isUniqueViolation(error, "users_username_unique")) {
        continue; // derived username collided with an existing learner — retry with a suffix
      }
      throw error;
    }
  }

  throw new Error(`Could not provision a unique username after ${MAX_USERNAME_ATTEMPTS} attempts`);
}

/**
 * The only function allowed to read a Clerk user ID (IAM-004, PRD 11.2). Resolves the
 * active Clerk session to the internal `users` row, creating the `users` +
 * `auth_identities` pair on first sign-in (IAM-001). Idempotent under concurrent calls
 * for the same session, via the unique index on auth_identities(provider, provider_user_id).
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const existing = await findUserByProviderIdentity(CLERK_PROVIDER, clerkUserId);
  if (existing) return existing;

  return provisionUser(CLERK_PROVIDER, clerkUserId);
}

import { authIdentities, db, users } from "@dirakitpro/database";
import { and, eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
  currentUser: () => mockCurrentUser(),
}));

const { getCurrentUser } = await import("./get-current-user");

function fakeClerkUser(overrides: { email?: string; username?: string | null } = {}) {
  const email = overrides.email ?? `test-${Math.random().toString(36).slice(2, 10)}@example.com`;
  return {
    primaryEmailAddress: { emailAddress: email },
    emailAddresses: [{ emailAddress: email }],
    username: overrides.username ?? null,
    fullName: "Test Learner",
    imageUrl: "https://example.com/avatar.png",
  };
}

async function cleanupByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return;
  await db.delete(authIdentities).where(eq(authIdentities.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));
}

describe("getCurrentUser", () => {
  const createdEmails: string[] = [];

  afterEach(async () => {
    vi.clearAllMocks();
    for (const email of createdEmails.splice(0)) {
      await cleanupByEmail(email);
    }
  });

  it("returns null when there is no active Clerk session (proxy.ts should have redirected already)", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const user = await getCurrentUser();

    expect(user).toBeNull();
    expect(mockCurrentUser).not.toHaveBeenCalled();
  });

  it("creates exactly one internal User on first sign-in and is idempotent on a repeat call (IAM-001)", async () => {
    const clerkUserId = `clerk_test_${Math.random().toString(36).slice(2, 10)}`;
    const clerkUser = fakeClerkUser();
    createdEmails.push(clerkUser.primaryEmailAddress.emailAddress);

    mockAuth.mockResolvedValue({ userId: clerkUserId });
    mockCurrentUser.mockResolvedValue(clerkUser);

    const first = await getCurrentUser();
    const second = await getCurrentUser();

    expect(first).not.toBeNull();
    expect(first?.role).toBe("LEARNER");
    expect(second?.id).toBe(first?.id);

    const identityRows = await db
      .select()
      .from(authIdentities)
      .where(and(eq(authIdentities.provider, "clerk"), eq(authIdentities.providerUserId, clerkUserId)));
    expect(identityRows).toHaveLength(1);

    const userRows = await db.select().from(users).where(eq(users.id, first!.id));
    expect(userRows).toHaveLength(1);
  });

  it("stays idempotent when two calls race for the same brand-new session", async () => {
    const clerkUserId = `clerk_test_${Math.random().toString(36).slice(2, 10)}`;
    const clerkUser = fakeClerkUser();
    createdEmails.push(clerkUser.primaryEmailAddress.emailAddress);

    mockAuth.mockResolvedValue({ userId: clerkUserId });
    mockCurrentUser.mockResolvedValue(clerkUser);

    const [a, b] = await Promise.all([getCurrentUser(), getCurrentUser()]);

    expect(a?.id).toBe(b?.id);

    const identityRows = await db
      .select()
      .from(authIdentities)
      .where(and(eq(authIdentities.provider, "clerk"), eq(authIdentities.providerUserId, clerkUserId)));
    expect(identityRows).toHaveLength(1);
  });

  it("resolves a username collision by retrying with a suffix instead of failing", async () => {
    const takenUsername = `dupe-${Math.random().toString(36).slice(2, 8)}`;
    const existingEmail = `existing-${Math.random().toString(36).slice(2, 10)}@example.com`;
    createdEmails.push(existingEmail);
    await db.insert(users).values({
      email: existingEmail,
      username: takenUsername,
      displayName: "Existing Learner",
      role: "LEARNER",
    });

    const clerkUserId = `clerk_test_${Math.random().toString(36).slice(2, 10)}`;
    const clerkUser = fakeClerkUser({ username: takenUsername });
    createdEmails.push(clerkUser.primaryEmailAddress.emailAddress);

    mockAuth.mockResolvedValue({ userId: clerkUserId });
    mockCurrentUser.mockResolvedValue(clerkUser);

    const user = await getCurrentUser();

    expect(user).not.toBeNull();
    expect(user?.username).not.toBe(takenUsername);
    expect(user?.username.startsWith(takenUsername)).toBe(true);
  });
});

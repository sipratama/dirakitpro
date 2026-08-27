"use client";

import { useClerk } from "@clerk/nextjs";

// Shared by AccountMenu's "Keluar" dropdown item and the standalone
// SignOutButton on /account, so the sign-out behavior — Clerk signOut,
// redirect to "/" (SCREEN_INVENTORY.md "Cross-cutting / Global Navigation",
// IAM-002) — lives in exactly one place instead of being duplicated per caller.
export function useSignOut(): () => void {
  const { signOut } = useClerk();
  return () => void signOut({ redirectUrl: "/" });
}

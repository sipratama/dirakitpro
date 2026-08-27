"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/components/home/use-sign-out";

// Standalone "Keluar" action for /account — reuses AccountMenu's sign-out
// behavior via the shared useSignOut hook (Bagian 2 instruction: "same as the
// dropdown's, may reuse the same client component").
export function SignOutButton() {
  const handleSignOut = useSignOut();

  return (
    <Button type="button" variant="outline" onClick={handleSignOut}>
      Keluar
    </Button>
  );
}

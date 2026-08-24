"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Renders the Midtrans Snap widget trigger (COM-009). The `snap.js` script
 * URL/`data-client-key` come from the caller (a Server Component reading
 * server-side env), never from a `NEXT_PUBLIC_` var — the client key itself
 * is not secret and is meant to be embedded exactly like this, but keeping
 * the read server-side avoids ever needing to touch `MIDTRANS_SERVER_KEY`
 * from client code.
 *
 * Every Snap callback (`onSuccess`/`onPending`/`onError`/`onClose`) routes to
 * the SAME `/payment/[orderId]` page rather than declaring success/failure
 * itself — that page reads the authoritative, webhook-driven Order state
 * (COM-010). The callback here only decides where to navigate, never what
 * happened.
 */
export function SnapCheckout({
  token,
  orderId,
  clientKey,
  isProduction,
}: {
  token: string;
  orderId: string;
  clientKey: string;
  isProduction: boolean;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const snapJsUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  function openSnap() {
    window.snap?.pay(token, {
      onSuccess: () => router.push(`/payment/${orderId}`),
      onPending: () => router.push(`/payment/${orderId}`),
      onError: () => router.push(`/payment/${orderId}`),
      onClose: () => router.push(`/payment/${orderId}`),
    });
  }

  return (
    <>
      <Script src={snapJsUrl} data-client-key={clientKey} onReady={() => setReady(true)} />
      <Button onClick={openSnap} disabled={!ready}>
        Bayar sekarang
      </Button>
    </>
  );
}

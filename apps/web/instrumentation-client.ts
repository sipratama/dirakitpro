import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (posthogKey && posthogHost) {
  try {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      autocapture: false,
      capture_pageleave: false,
      capture_pageview: false,
      disable_session_recording: true,
    });
  } catch (error) {
    console.error("PostHog initialization failed", error);
  }
}

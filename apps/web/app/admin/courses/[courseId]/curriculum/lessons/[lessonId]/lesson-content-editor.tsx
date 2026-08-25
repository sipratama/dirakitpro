"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ContentBlockRenderer } from "@/components/learning/blocks/content-block-renderer";

export type LessonContentEditorState = { blocks: unknown[]; error: string | null; saved: boolean };

const textareaClass =
  "h-[32rem] w-full rounded-control border border-neutral-300 bg-surface px-3 py-2 font-mono text-small text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal";

/**
 * CURRICULUM_MANAGEMENT.md §3 — two side-by-side panels sharing one textarea.
 * Both buttons submit through the SAME `useActionState`-managed action,
 * distinguished only by the native submit button `name="intent"` value —
 * "Preview" parses/validates the current textarea value with no DB write
 * (a real server round-trip, not client-side parsing on every keystroke,
 * which is explicitly out of scope/YAGNI); "Simpan" does the same validation
 * and then actually persists. Sharing one action means an invalid submission
 * gets the exact same clear inline error either way, never an uncaught
 * Server Action error surfaced as a generic error boundary.
 */
export function LessonContentEditor({
  initialContentJson,
  initialBlocks,
  submitAction,
}: {
  initialContentJson: string;
  initialBlocks: unknown[];
  submitAction: (state: LessonContentEditorState, formData: FormData) => Promise<LessonContentEditorState>;
}) {
  const [state, formAction, isPending] = useActionState(submitAction, {
    blocks: initialBlocks,
    error: null,
    saved: false,
  });

  return (
    <form action={formAction} className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <textarea name="content" defaultValue={initialContentJson} spellCheck={false} className={textareaClass} />
        <div className="flex items-center gap-2">
          <Button type="submit" name="intent" value="preview" variant="outline" disabled={isPending}>
            Preview
          </Button>
          <Button type="submit" name="intent" value="save" disabled={isPending}>
            Simpan
          </Button>
          {state.saved && <span className="text-small text-success-text">Tersimpan.</span>}
        </div>
        {state.error && (
          <p className="rounded-control bg-danger-bg px-3 py-2 text-small text-danger-text">{state.error}</p>
        )}
      </div>

      <div className="rounded-card border border-neutral-100 p-4">
        <ContentBlockRenderer blocks={state.blocks} />
      </div>
    </form>
  );
}

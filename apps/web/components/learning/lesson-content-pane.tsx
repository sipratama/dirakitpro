"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContentBlockRenderer } from "@/components/learning/blocks/content-block-renderer";
import { markLessonCompleteAction } from "@/app/learn/[courseSlug]/[lessonSlug]/actions";

/**
 * Content pane + completion action for a lesson (§3.1/§3.2/§3.3). Owns the
 * "have all task items been checked" state locally because that's the only
 * thing gating the button for a CHECKPOINT lesson — everything else
 * (auth, ownership, the actual mutation) happens server-side in the bound
 * Server Action, never trusted from here.
 */
export function LessonContentPane({
  blocks,
  courseSlug,
  lessonSlug,
  isCheckpoint,
  hasTaskBlock,
  isCompleted,
}: {
  blocks: unknown;
  courseSlug: string;
  lessonSlug: string;
  isCheckpoint: boolean;
  hasTaskBlock: boolean;
  isCompleted: boolean;
}) {
  const [taskAllComplete, setTaskAllComplete] = useState(!hasTaskBlock);
  const canMarkComplete = !isCheckpoint || taskAllComplete;
  const markComplete = markLessonCompleteAction.bind(null, courseSlug, lessonSlug);

  return (
    <div className="flex flex-col gap-8">
      <ContentBlockRenderer blocks={blocks} onTaskAllCompleteChange={setTaskAllComplete} />
      <form action={markComplete}>
        <Button type="submit" disabled={isCompleted || !canMarkComplete}>
          {isCompleted ? "Selesai ditandai" : "Tandai selesai"}
        </Button>
      </form>
    </div>
  );
}

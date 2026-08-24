"use client";

import { useState } from "react";
import type { TaskContentBlock } from "@/features/learning/content-block";

// LEARNING_WORKSPACE.md 3.3: purely self-reported, ephemeral UI state — not
// persisted. Its only job is telling the caller (the lesson page, Fase 4)
// whether every item is checked, so it can gate the "Tandai selesai" button.
export function TaskBlock({
  block,
  onAllCompleteChange,
}: {
  block: TaskContentBlock;
  onAllCompleteChange?: (allComplete: boolean) => void;
}) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
    onAllCompleteChange?.(block.items.length > 0 && block.items.every((item) => next.has(item.id)));
  }

  return (
    <ul className="flex flex-col gap-2">
      {block.items.map((item) => (
        <li key={item.id}>
          <label className="flex items-center gap-2 text-body text-brand-ink">
            <input
              type="checkbox"
              checked={checkedIds.has(item.id)}
              onChange={() => toggle(item.id)}
              className="h-4 w-4 rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
            />
            {item.label}
          </label>
        </li>
      ))}
    </ul>
  );
}

// DESIGN.md 5.2: track neutral-100, fill brand-teal, height 8px, full radius.
// BLD-003: this is the dominant progress signal in the workspace — never
// share this color with anything decorative on the same screen.
export function BuildProgressBar({ ratio }: { ratio: number }) {
  const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-brand-teal" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-small text-neutral-600">{percent}% Build Progress</span>
    </div>
  );
}

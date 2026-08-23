export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="h-9 w-32 animate-pulse rounded-control bg-neutral-100" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-card border border-neutral-100 bg-neutral-100/50"
          />
        ))}
      </div>
    </div>
  );
}

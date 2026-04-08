export function LoadingSkeleton({ variant = "default" }) {
  if (variant === "dashboard") {
    return (
      <div className="w-full min-w-0 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
        <div className="skeleton-shimmer h-44 rounded-[2rem]" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="skeleton-shimmer h-3 w-24 rounded" />
              <div className="skeleton-shimmer h-8 w-24 rounded" />
              <div className="skeleton-shimmer h-3 w-20 rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="skeleton-shimmer h-60 rounded-2xl" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="skeleton-shimmer h-24 rounded-2xl" />
              <div className="skeleton-shimmer h-24 rounded-2xl" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="skeleton-shimmer h-36 rounded-3xl" />
            <div className="skeleton-shimmer h-56 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "weather") {
    return (
      <div className="w-full min-w-0 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="skeleton-shimmer h-56 rounded-[2rem]" />
          <div className="space-y-3">
            <div className="skeleton-shimmer h-24 rounded-2xl" />
            <div className="skeleton-shimmer h-24 rounded-2xl" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-12 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "currency-grid") {
    return (
      <div className="mt-5 grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-slate-700 bg-slate-950/55 p-4">
            <div className="skeleton-shimmer h-4 w-24 rounded" />
            <div className="skeleton-shimmer h-8 w-28 rounded" />
            <div className="skeleton-shimmer h-3 w-32 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "crypto") {
    return (
      <div className="w-full min-w-0 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
        <div className="skeleton-shimmer h-28 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
              <div className="skeleton-shimmer h-3 w-20 rounded" />
              <div className="skeleton-shimmer h-7 w-28 rounded" />
              <div className="skeleton-shimmer h-3 w-16 rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 skeleton-shimmer h-[320px] rounded-2xl" />
          <div className="skeleton-shimmer h-[320px] rounded-2xl" />
        </div>
        <div className="skeleton-shimmer h-56 rounded-2xl" />
      </div>
    );
  }

  return <div className="skeleton-shimmer h-40 rounded-2xl border border-slate-800 bg-slate-900/60" />;
}

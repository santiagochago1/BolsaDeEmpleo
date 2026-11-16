export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="space-y-8"
    >
      <span className="sr-only">Cargando ofertas de empleo...</span>

      <div className="space-y-3">
        <div className="h-9 w-64 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-full max-w-xl animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="space-y-4">
              <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="mt-6 h-11 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

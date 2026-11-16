'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="mx-auto max-w-lg rounded-lg border border-red-200 bg-white p-8 text-center shadow-xs dark:border-red-900 dark:bg-slate-900"
    >
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Algo salió mal
      </h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {error.message || 'Ocurrió un error inesperado al cargar esta página.'}
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Reintentar
        </button>
      </div>
    </section>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <section
      aria-labelledby="titulo-no-encontrado"
      className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900"
    >
      <h1
        id="titulo-no-encontrado"
        className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
      >
        404 · Página no encontrada
      </h1>
      <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
        El recurso o la oferta de empleo que buscas no existe o fue movido.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}

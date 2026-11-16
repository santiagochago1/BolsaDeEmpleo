export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { listarOfertas } from '@/services/oferta.service';

const ETIQUETA_MODALIDAD: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

function SkeletonOfertas() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Cargando ofertas disponibles...</span>
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
  );
}

async function ListaOfertasDisponibles() {
  await connection();
  const { items: ofertas } = await listarOfertas({}, 20);

  if (ofertas.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900"
      >
        <p className="text-base font-medium text-slate-700 dark:text-slate-300">
          No hay ofertas disponibles en este momento.
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Vuelve pronto para consultar nuevas oportunidades laborales.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {ofertas.map((oferta) => (
        <article
          key={oferta.id}
          className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {oferta.titulo}
            </h2>

            <dl className="flex flex-wrap gap-2 text-xs font-medium">
              <div className="rounded-full bg-blue-50 px-3 py-1 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <dt className="sr-only">Modalidad</dt>
                <dd>
                  {ETIQUETA_MODALIDAD[oferta.modalidad] ?? oferta.modalidad}
                </dd>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <dt className="sr-only">Ciudad</dt>
                <dd>{oferta.ciudad}</dd>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                <dt className="sr-only">Área</dt>
                <dd>{oferta.area}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Link
              href={`/ofertas/${oferta.id}`}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Ver oferta
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Bolsa de Empleo
        </h1>
        <p className="max-w-[70ch] text-base text-slate-600 dark:text-slate-400">
          Explora las vacantes abiertas publicadas por empresas y postúlate
          adjuntando tu hoja de vida en formato PDF.
        </p>
      </div>

      <section aria-label="Ofertas disponibles">
        <Suspense fallback={<SkeletonOfertas />}>
          <ListaOfertasDisponibles />
        </Suspense>
      </section>
    </div>
  );
}

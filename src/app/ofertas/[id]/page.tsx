export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import FormularioPostulacion from '@/components/FormularioPostulacion';
import { ErrorNoEncontrado } from '@/lib/errores';
import { obtenerOferta } from '@/services/oferta.service';

const ETIQUETA_MODALIDAD: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

interface OfertaDetallePageProps {
  params: Promise<{ id: string }>;
}

function SkeletonDetalleOferta() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto max-w-3xl space-y-8"
    >
      <span className="sr-only">Cargando detalle de la oferta...</span>
      <div className="space-y-4">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex gap-3">
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="h-48 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

async function ContenidoDetalleOferta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  let oferta;
  try {
    oferta = await obtenerOferta(id);
  } catch (error) {
    if (error instanceof ErrorNoEncontrado) {
      notFound();
    }
    throw error;
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
        >
          ← Volver a ofertas disponibles
        </Link>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {oferta.titulo}
        </h1>

        <dl className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
          <div className="rounded-full bg-blue-50 px-3.5 py-1 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <dt className="sr-only">Modalidad</dt>
            <dd>
              {ETIQUETA_MODALIDAD[oferta.modalidad] ?? oferta.modalidad}
            </dd>
          </div>
          <div className="rounded-full bg-slate-100 px-3.5 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <dt className="sr-only">Ciudad</dt>
            <dd>{oferta.ciudad}</dd>
          </div>
          <div className="rounded-full bg-emerald-50 px-3.5 py-1 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <dt className="sr-only">Área</dt>
            <dd>{oferta.area}</dd>
          </div>
        </dl>
      </div>

      <section
        aria-labelledby="heading-descripcion"
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="heading-descripcion"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Descripción de la oferta
        </h2>
        <p className="mt-3 max-w-[70ch] whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {oferta.descripcion}
        </p>
      </section>

      <section aria-labelledby="heading-postulacion" className="space-y-4">
        <h2
          id="heading-postulacion"
          className="text-xl font-semibold text-slate-900 dark:text-slate-100"
        >
          Postularse a esta vacante
        </h2>
        <FormularioPostulacion
          ofertaId={oferta.id}
          estadoOferta={oferta.estado}
        />
      </section>
    </article>
  );
}

export default function OfertaDetallePage({
  params,
}: OfertaDetallePageProps) {
  return (
    <Suspense fallback={<SkeletonDetalleOferta />}>
      <ContenidoDetalleOferta params={params} />
    </Suspense>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { EstadoPostulacion } from '@/schemas/postulacion.schema';
import type { RolUsuario } from '@/types/auth.types';

interface MiPostulacion {
  id: string;
  ofertaId: string;
  candidatoUid: string;
  tituloOferta: string;
  ciudadOferta: string;
  estado: EstadoPostulacion;
  cvPathname: string;
  creadaEn: string;
}

const ESTILO_ESTADO: Record<EstadoPostulacion, string> = {
  recibido:
    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  'en revisión':
    'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  entrevista:
    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  rechazado: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  contratado:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
};

export default function MisPostulacionesPage() {
  const router = useRouter();
  const [postulaciones, setPostulaciones] = useState<MiPostulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      try {
        const resSesion = await fetch('/api/auth/yo', {
          method: 'GET',
          credentials: 'include',
        });

        if (!resSesion.ok) {
          router.replace('/');
          return;
        }

        const datosSesion = (await resSesion.json()) as {
          usuario?: { rol?: RolUsuario };
          rol?: RolUsuario;
        };

        const rol = datosSesion.usuario?.rol ?? datosSesion.rol;

        if (rol !== 'candidato') {
          router.replace('/');
          return;
        }

        const resPostulaciones = await fetch('/api/mis-postulaciones', {
          method: 'GET',
          credentials: 'include',
        });

        if (!resPostulaciones.ok) {
          throw new Error('No se pudieron cargar tus postulaciones.');
        }

        const datos = (await resPostulaciones.json()) as {
          items?: MiPostulacion[];
        };

        if (!cancelado) {
          setPostulaciones(datos.items ?? []);
        }
      } catch (err: unknown) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error al consultar tus postulaciones.'
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [router]);

  if (cargando) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="space-y-6"
      >
        <span className="sr-only">Cargando tus postulaciones...</span>
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-24 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Mis Postulaciones
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Consulta el estado actualizado de cada vacante a la que te has
          postulado.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}

      <section aria-label="Listado de mis postulaciones">
        {postulaciones.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              Aún no te has postulado a ninguna oferta.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Explorar ofertas disponibles
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {postulaciones.map((item) => (
              <li
                key={`${item.ofertaId}-${item.id}`}
                className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    <Link
                      href={`/ofertas/${item.ofertaId}`}
                      className="hover:text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:text-blue-400"
                    >
                      {item.tituloOferta}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.ciudadOferta ? `${item.ciudadOferta} · ` : ''}
                    Postulado el{' '}
                    <time dateTime={item.creadaEn}>
                      {new Date(item.creadaEn).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    aria-live="polite"
                    className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold capitalize ${
                      ESTILO_ESTADO[item.estado] ?? ESTILO_ESTADO.recibido
                    }`}
                  >
                    Estado: {item.estado}
                  </span>

                  <Link
                    href={`/ofertas/${item.ofertaId}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Ver oferta
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

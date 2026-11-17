'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type {
  EstadoPostulacion,
  PostulacionRespuesta,
} from '@/schemas/postulacion.schema';
import type { RolUsuario } from '@/types/auth.types';

const ESTADOS_POSTULACION: EstadoPostulacion[] = [
  'recibido',
  'en revisión',
  'entrevista',
  'rechazado',
  'contratado',
];

function SkeletonCandidatos() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Cargando candidatos de la oferta...</span>
      <div className="h-9 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}

function CandidatosContent() {
  const params = useParams<{ id: string }>();
  const ofertaId = params?.id ?? '';
  const router = useRouter();

  const [candidatos, setCandidatos] = useState<PostulacionRespuesta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizandoUid, setActualizandoUid] = useState<string | null>(null);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarCandidatos() {
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

        if (rol !== 'empresa') {
          router.replace('/');
          return;
        }

        const res = await fetch(`/api/ofertas/${ofertaId}/candidatos`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          const datosError = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            datosError?.error ??
              'No tienes acceso a los candidatos de esta oferta o la oferta no existe.'
          );
        }

        const lista = (await res.json()) as PostulacionRespuesta[];
        if (!cancelado) {
          setCandidatos(Array.isArray(lista) ? lista : []);
        }
      } catch (err: unknown) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error al cargar los candidatos.'
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    if (ofertaId) {
      cargarCandidatos();
    }

    return () => {
      cancelado = true;
    };
  }, [ofertaId, router]);

  async function manejarCambioEstado(
    candidatoUid: string,
    nuevoEstado: EstadoPostulacion
  ) {
    setError(null);
    setMensajeEstado(null);
    setActualizandoUid(candidatoUid);

    try {
      const res = await fetch(
        `/api/ofertas/${ofertaId}/candidatos/${candidatoUid}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Origin: window.location.origin,
          },
          credentials: 'include',
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (!res.ok) {
        const datosError = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          datosError?.error ?? 'No se pudo actualizar el estado del candidato.'
        );
      }

      const actualizada = (await res.json()) as PostulacionRespuesta;
      setCandidatos((prev) =>
        prev.map((c) =>
          c.candidatoUid === candidatoUid
            ? { ...c, estado: actualizada.estado }
            : c
        )
      );
      setMensajeEstado(
        `Estado actualizado a "${actualizada.estado}" para ${actualizada.nombre}.`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cambiar el estado del candidato.'
      );
    } finally {
      setActualizandoUid(null);
    }
  }

  if (cargando) {
    return <SkeletonCandidatos />;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/empresa"
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
        >
          ← Volver al panel de empresa
        </Link>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Candidatos Postulados
        </h1>
        <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
          Revisa las hojas de vida en PDF y actualiza el estado del proceso de
          selección.
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

      {mensajeEstado && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {mensajeEstado}
        </div>
      )}

      <section aria-label="Lista de candidatos">
        {candidatos.length === 0 ? (
          <div
            role="status"
            className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
          >
            Aún no hay candidatos postulados para esta oferta.
          </div>
        ) : (
          <ul className="space-y-4">
            {candidatos.map((candidato) => {
              const selectId = `estado-${candidato.candidatoUid}`;
              const urlDescargaCv = `/api/postulaciones/${encodeURIComponent(
                ofertaId
              )}/cv?candidatoUid=${encodeURIComponent(candidato.candidatoUid)}`;

              return (
                <li
                  key={candidato.candidatoUid}
                  className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs lg:flex-row lg:items-center dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {candidato.nombre}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {candidato.correo} · Postulado el{' '}
                      <time dateTime={candidato.creadaEn}>
                        {new Date(candidato.creadaEn).toLocaleDateString(
                          'es-CO',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </time>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={selectId}
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Estado:
                      </label>
                      <select
                        id={selectId}
                        value={candidato.estado}
                        disabled={actualizandoUid === candidato.candidatoUid}
                        onChange={(e) =>
                          manejarCambioEstado(
                            candidato.candidatoUid,
                            e.target.value as EstadoPostulacion
                          )
                        }
                        className="min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-2 focus:outline-blue-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        {ESTADOS_POSTULACION.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <a
                      href={urlDescargaCv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Descargar CV (PDF)
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function CandidatosPorOfertaPage() {
  return (
    <Suspense fallback={<SkeletonCandidatos />}>
      <CandidatosContent />
    </Suspense>
  );
}

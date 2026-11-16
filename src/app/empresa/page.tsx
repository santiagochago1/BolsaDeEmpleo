'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import type {
  ModalidadOferta,
  OfertaRespuesta,
} from '@/schemas/oferta.schema';
import type { RolUsuario } from '@/types/auth.types';

const ETIQUETA_MODALIDAD: Record<ModalidadOferta, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

export default function EmpresaPage() {
  const router = useRouter();
  const [ofertas, setOfertas] = useState<OfertaRespuesta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [modalidad, setModalidad] = useState<ModalidadOferta>('presencial');
  const [area, setArea] = useState('');
  const [creando, setCreando] = useState(false);
  const [cerrandoId, setCerrandoId] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarOfertasEmpresa = useCallback(async () => {
    const res = await fetch('/api/empresa/ofertas', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('No se pudieron cargar las ofertas de tu empresa.');
    }

    const datos = (await res.json()) as { items?: OfertaRespuesta[] };
    setOfertas(datos.items ?? []);
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function inicializar() {
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

        await cargarOfertasEmpresa();
      } catch (err: unknown) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar el panel de empresa.'
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    inicializar();

    return () => {
      cancelado = true;
    };
  }, [router, cargarOfertasEmpresa]);

  async function manejarCrearOferta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setMensajeExito(null);
    setCreando(true);

    try {
      const res = await fetch('/api/ofertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        credentials: 'include',
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          ciudad: ciudad.trim(),
          modalidad,
          area: area.trim(),
        }),
      });

      if (!res.ok) {
        const datosError = (await res.json().catch(() => null)) as {
          error?: string;
          detalles?: string[];
        } | null;
        const detalle = datosError?.detalles?.join(' · ');
        throw new Error(
          detalle
            ? `${datosError?.error}: ${detalle}`
            : (datosError?.error ?? 'No se pudo crear la oferta.')
        );
      }

      setTitulo('');
      setDescripcion('');
      setCiudad('');
      setModalidad('presencial');
      setArea('');
      setMensajeExito('Oferta publicada correctamente.');
      await cargarOfertasEmpresa();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error inesperado al crear la oferta.'
      );
    } finally {
      setCreando(false);
    }
  }

  async function manejarCerrarOferta(ofertaId: string) {
    setError(null);
    setMensajeExito(null);
    setCerrandoId(ofertaId);

    try {
      const res = await fetch(`/api/ofertas/${ofertaId}`, {
        method: 'PATCH',
        headers: {
          Origin: window.location.origin,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const datosError = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          datosError?.error ?? 'No fue posible cerrar la oferta.'
        );
      }

      setMensajeExito('La oferta fue cerrada exitosamente.');
      await cargarOfertasEmpresa();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al cerrar la oferta.'
      );
    } finally {
      setCerrandoId(null);
    }
  }

  if (cargando) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="space-y-6"
      >
        <span className="sr-only">Cargando panel de empresa...</span>
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Panel de Empresa
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Publica nuevas vacantes, cierra procesos finalizados y revisa los
          candidatos postulados.
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

      {mensajeExito && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {mensajeExito}
        </div>
      )}

      <section
        aria-labelledby="heading-nueva-oferta"
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="heading-nueva-oferta"
          className="text-xl font-semibold text-slate-900 dark:text-slate-100"
        >
          Crear nueva oferta
        </h2>

        <form
          onSubmit={manejarCrearOferta}
          className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2"
          noValidate
        >
          <div className="md:col-span-2">
            <label
              htmlFor="titulo-oferta"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Título de la vacante (mínimo 5 caracteres)
            </label>
            <input
              id="titulo-oferta"
              name="titulo"
              type="text"
              required
              minLength={5}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={creando}
              className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-2 focus:outline-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="ciudad-oferta"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Ciudad
            </label>
            <input
              id="ciudad-oferta"
              name="ciudad"
              type="text"
              required
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              disabled={creando}
              className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-2 focus:outline-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="modalidad-oferta"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Modalidad
            </label>
            <select
              id="modalidad-oferta"
              name="modalidad"
              value={modalidad}
              onChange={(e) =>
                setModalidad(e.target.value as ModalidadOferta)
              }
              disabled={creando}
              className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-2 focus:outline-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="area-oferta"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Área profesional
            </label>
            <input
              id="area-oferta"
              name="area"
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              disabled={creando}
              className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-2 focus:outline-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="descripcion-oferta"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Descripción detallada (máximo 2000 caracteres)
            </label>
            <textarea
              id="descripcion-oferta"
              name="descripcion"
              rows={4}
              required
              maxLength={2000}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={creando}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-2 focus:outline-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={creando}
              aria-busy={creando}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creando ? 'Publicando oferta...' : 'Publicar oferta'}
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="heading-mis-ofertas" className="space-y-4">
        <h2
          id="heading-mis-ofertas"
          className="text-xl font-semibold text-slate-900 dark:text-slate-100"
        >
          Mis ofertas publicadas
        </h2>

        {ofertas.length === 0 ? (
          <div
            role="status"
            className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
          >
            Aún no has creado ninguna oferta de empleo.
          </div>
        ) : (
          <ul className="space-y-4">
            {ofertas.map((oferta) => (
              <li
                key={oferta.id}
                className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {oferta.titulo}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${
                        oferta.estado === 'abierta'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {oferta.estado}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {oferta.ciudad} ·{' '}
                    {ETIQUETA_MODALIDAD[oferta.modalidad] ?? oferta.modalidad}{' '}
                    · {oferta.area}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/empresa/ofertas/${oferta.id}/candidatos`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Ver candidatos
                  </Link>

                  {oferta.estado === 'abierta' && (
                    <button
                      type="button"
                      disabled={cerrandoId === oferta.id}
                      onClick={() => manejarCerrarOferta(oferta.id)}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {cerrandoId === oferta.id
                        ? 'Cerrando...'
                        : 'Cerrar oferta'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

'use client';

import { upload } from '@vercel/blob/client';
import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';
import type { RolUsuario } from '@/types/auth.types';

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

interface UsuarioActual {
  uid: string;
  correo: string;
  rol: RolUsuario;
}

interface FormularioPostulacionProps {
  ofertaId: string;
  estadoOferta: 'abierta' | 'cerrada';
}

export default function FormularioPostulacion({
  ofertaId,
  estadoOferta,
}: FormularioPostulacionProps) {
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [etapaEnvio, setEtapaEnvio] = useState<
    'inactivo' | 'subiendo_cv' | 'enviando_postulacion'
  >('inactivo');
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function verificarSesion() {
      try {
        const res = await fetch('/api/auth/yo', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          if (!cancelado) setUsuario(null);
          return;
        }

        const datos = (await res.json()) as
          | { usuario?: UsuarioActual }
          | { uid?: string; email?: string; correo?: string; rol?: RolUsuario };

        if (!cancelado) {
          if ('usuario' in datos && datos.usuario) {
            setUsuario(datos.usuario);
          } else if ('uid' in datos && datos.uid && datos.rol) {
            setUsuario({
              uid: datos.uid,
              correo: datos.correo ?? datos.email ?? '',
              rol: datos.rol,
            });
          }
        }
      } catch {
        if (!cancelado) setUsuario(null);
      } finally {
        if (!cancelado) setCargandoSesion(false);
      }
    }

    verificarSesion();

    return () => {
      cancelado = true;
    };
  }, []);

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (!usuario) {
      setError('Debes iniciar sesión para postularte.');
      return;
    }

    if (!archivo) {
      setError('Por favor selecciona tu hoja de vida en formato PDF.');
      return;
    }

    const esPdf =
      archivo.type === 'application/pdf' &&
      archivo.name.toLowerCase().endsWith('.pdf');
    if (!esPdf) {
      setError('El archivo debe ser un documento PDF válido (.pdf).');
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      setError('El archivo PDF no puede superar los 5 MB.');
      return;
    }

    try {
      setEtapaEnvio('subiendo_cv');
      const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const pathnameDestino = `usuarios/${usuario.uid}/${nombreSeguro}`;

      const blob = await upload(pathnameDestino, archivo, {
        access: 'private',
        handleUploadUrl: '/api/cv/upload',
      });

      setEtapaEnvio('enviando_postulacion');
      const respuesta = await fetch(`/api/ofertas/${ofertaId}/postulaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        credentials: 'include',
        body: JSON.stringify({
          cvPathname: blob.pathname,
        }),
      });

      if (!respuesta.ok) {
        const datosError = (await respuesta.json().catch(() => null)) as {
          error?: string;
        } | null;

        if (respuesta.status === 409) {
          throw new Error(
            datosError?.error ?? 'Ya te has postulado previamente a esta oferta.'
          );
        }
        if (respuesta.status === 403) {
          throw new Error(
            datosError?.error ??
              'No tienes permisos para postularte a esta oferta.'
          );
        }
        throw new Error(
          datosError?.error ?? 'No fue posible registrar tu postulación.'
        );
      }

      setExito(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al procesar tu postulación.');
      }
    } finally {
      setEtapaEnvio('inactivo');
    }
  }

  if (estadoOferta !== 'abierta') {
    return (
      <div
        role="status"
        className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      >
        Esta oferta se encuentra cerrada y ya no recibe nuevas postulaciones.
      </div>
    );
  }

  if (cargandoSesion) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <span className="sr-only">Verificando sesión de usuario...</span>
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-11 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">
          Para enviar tu hoja de vida a esta oferta, primero debes acceder a tu
          cuenta de candidato.
        </p>
        <Link
          href="/login"
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Inicia sesión para postularte
        </Link>
      </div>
    );
  }

  if (usuario.rol !== 'candidato') {
    return (
      <div
        role="status"
        className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      >
        Estás autenticado con rol de <strong>{usuario.rol}</strong>. Solo las
        cuentas con rol de candidato pueden postularse a ofertas.
      </div>
    );
  }

  if (exito) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      >
        <h3 className="text-base font-semibold">
          ¡Postulación enviada con éxito!
        </h3>
        <p className="mt-1 text-sm">
          Hemos recibido tu hoja de vida correctamente. La empresa revisará tu
          perfil pronto.
        </p>
      </div>
    );
  }

  const procesando = etapaEnvio !== 'inactivo';

  return (
    <form
      onSubmit={manejarSubmit}
      className="space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
      noValidate
    >
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="cv-pdf"
          className="block text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          Hoja de vida en PDF (máximo 5 MB)
        </label>
        <input
          id="cv-pdf"
          name="cv"
          type="file"
          accept="application/pdf,.pdf"
          required
          disabled={procesando}
          onChange={(e) => {
            const seleccionado = e.target.files?.[0] ?? null;
            setArchivo(seleccionado);
            setError(null);
          }}
          className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:min-h-[44px] file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 dark:text-slate-300 dark:file:bg-blue-950 dark:file:text-blue-200"
        />
      </div>

      <button
        type="submit"
        disabled={procesando}
        aria-busy={procesando}
        className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {etapaEnvio === 'subiendo_cv'
          ? 'Subiendo CV en PDF...'
          : etapaEnvio === 'enviando_postulacion'
            ? 'Enviando postulación...'
            : 'Enviar postulación'}
      </button>
    </form>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BotonCerrarSesion() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function manejarCerrarSesion() {
    setCargando(true);
    try {
      await fetch('/api/auth/sesion', {
        method: 'DELETE',
        headers: {
          Origin: window.location.origin,
        },
        credentials: 'include',
      });
    } catch {
      // Ignoramos errores de red para redirigir y limpiar estado igualmente
    } finally {
      setCargando(false);
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={manejarCerrarSesion}
      disabled={cargando}
      aria-busy={cargando}
      className="inline-flex min-h-[44px] cursor-pointer items-center px-2 text-sm font-medium text-slate-700 transition-colors hover:text-red-600 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-200 dark:hover:text-red-400"
    >
      {cargando ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </button>
  );
}

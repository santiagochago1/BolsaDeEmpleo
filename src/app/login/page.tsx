'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { auth } from '@/lib/firebase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const idToken = await credencial.user.getIdToken();

      const respuesta = await fetch('/api/auth/sesion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      if (!respuesta.ok) {
        const datosError = (await respuesta.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          datosError?.error ??
            'No se pudo iniciar la sesión en el servidor. Inténtalo de nuevo.'
        );
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        const codigoFirebase = (err as { code?: string }).code;
        if (
          codigoFirebase === 'auth/invalid-credential' ||
          codigoFirebase === 'auth/user-not-found' ||
          codigoFirebase === 'auth/wrong-password'
        ) {
          setError('Correo electrónico o contraseña incorrectos.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Ocurrió un error inesperado al iniciar sesión.');
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <section
      aria-labelledby="titulo-login"
      className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900"
    >
      <h1
        id="titulo-login"
        className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
      >
        Iniciar sesión
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Ingresa con tu cuenta para postularte a ofertas o gestionar tus
        vacantes.
      </p>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}

      <form onSubmit={manejarSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando}
            className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-2 focus:outline-offset-0 focus:outline-blue-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={cargando}
            className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-2 focus:outline-offset-0 focus:outline-blue-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          aria-busy={cargando}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}

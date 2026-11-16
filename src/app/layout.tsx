import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bolsa de Empleo | 39-bolsa-de-empleo',
  description:
    'Plataforma de ofertas de empleo y prácticas profesionales con postulación en PDF.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body
        className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-blue-700 focus:px-4 focus:py-2 focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Saltar al contenido
        </a>

        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
            >
              39 · Bolsa de Empleo
            </Link>

            <nav aria-label="Navegación principal">
              <ul className="flex flex-wrap items-center gap-3 sm:gap-5">
                <li>
                  <Link
                    href="/"
                    className="inline-flex min-h-[44px] items-center px-2 text-sm font-medium text-slate-700 hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mis-postulaciones"
                    className="inline-flex min-h-[44px] items-center px-2 text-sm font-medium text-slate-700 hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                  >
                    Mis postulaciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/empresa"
                    className="inline-flex min-h-[44px] items-center px-2 text-sm font-medium text-slate-700 hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                  >
                    Empresa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="inline-flex min-h-[44px] items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex-1 w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 focus:outline-none"
        >
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-5xl px-4 text-center text-sm text-slate-600 sm:px-6 lg:px-8 dark:text-slate-400">
            <p>
              <strong>39-bolsa-de-empleo</strong> — Plataforma de ofertas de
              empleo y postulaciones seguras.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

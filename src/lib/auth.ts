import { ErrorAutenticacion } from '@/lib/errores';
import {
  NOMBRE_COOKIE_SESION,
  obtenerUsuarioDesdeBearerToken,
  obtenerUsuarioDesdeCookie,
} from '@/services/auth.service';
import type { RolUsuario, Usuario } from '@/types/auth.types';

export function extraerCookie(
  cookieHeader: string | null,
  nombreCookie: string
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');
  for (const par of cookies) {
    const indiceIgual = par.indexOf('=');
    if (indiceIgual === -1) continue;

    const clave = par.slice(0, indiceIgual).trim();
    if (clave === nombreCookie) {
      const valor = par.slice(indiceIgual + 1).trim();
      return valor ? decodeURIComponent(valor) : null;
    }
  }

  return null;
}

export async function requerirUsuario(request: Request): Promise<Usuario> {
  const cookieHeader = request.headers.get('cookie');
  const cookieSesion = extraerCookie(cookieHeader, NOMBRE_COOKIE_SESION);

  if (cookieSesion) {
    return obtenerUsuarioDesdeCookie(cookieSesion);
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (token) {
      return obtenerUsuarioDesdeBearerToken(token);
    }
  }

  throw new ErrorAutenticacion(
    'No autenticado. Se requiere iniciar sesión.',
    401
  );
}

export function verificarOrigen(request: Request): void {
  const originHeader = request.headers.get('origin');
  const refererHeader = request.headers.get('referer');

  let origenPeticion: string | null = null;

  try {
    if (originHeader) {
      origenPeticion = new URL(originHeader).origin;
    } else if (refererHeader) {
      origenPeticion = new URL(refererHeader).origin;
    }
  } catch {
    throw new ErrorAutenticacion(
      'Cabecera Origin o Referer con formato inválido',
      403
    );
  }

  if (!origenPeticion) {
    throw new ErrorAutenticacion(
      'Falta cabecera Origin o Referer para verificación CSRF',
      403
    );
  }

  const urlBaseConfigurada = process.env.NEXT_PUBLIC_APP_URL;
  const origenEsperado = urlBaseConfigurada
    ? new URL(urlBaseConfigurada).origin
    : new URL(request.url).origin;

  if (origenPeticion !== origenEsperado) {
    throw new ErrorAutenticacion(
      'Origen de la petición no permitido (CSRF)',
      403
    );
  }
}

export function requerirRol(usuario: Usuario, rolRequerido: RolUsuario): void {
  if (usuario.rol !== rolRequerido) {
    throw new ErrorAutenticacion(
      `Acceso denegado. Se requiere el rol '${rolRequerido}'.`,
      403
    );
  }
}

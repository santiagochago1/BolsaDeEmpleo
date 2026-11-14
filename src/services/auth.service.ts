import { ErrorAutenticacion, ErrorDeConflicto } from '@/lib/errores';
import { adminAuth } from '@/lib/firebase/admin';
import {
  crearUsuario,
  obtenerUsuarioPorUid,
} from '@/repositories/usuario.repository';
import type {
  CrearSesionInput,
  ResultadoSesion,
  RolUsuario,
  Usuario,
} from '@/types/auth.types';

export const NOMBRE_COOKIE_SESION = 'sesion';
export const DURACION_SESION_SEGUNDOS = 60 * 60 * 24 * 5; // 5 días
export const DURACION_SESION_MS = DURACION_SESION_SEGUNDOS * 1000;
const MAX_ANTIGUEDAD_AUTH_SEGUNDOS = 5 * 60; // 5 minutos

export async function iniciarSesionConToken(
  input: CrearSesionInput
): Promise<ResultadoSesion> {
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(input.idToken, true);
  } catch {
    throw new ErrorAutenticacion('Token de autenticación inválido o expirado', 401);
  }

  const ahoraSegundos = Math.floor(Date.now() / 1000);
  if (ahoraSegundos - decodedToken.auth_time > MAX_ANTIGUEDAD_AUTH_SEGUNDOS) {
    throw new ErrorAutenticacion(
      'El inicio de sesión no es reciente. Por favor, vuelve a autenticarte.',
      401
    );
  }

  let usuario = await obtenerUsuarioPorUid(decodedToken.uid);

  if (!usuario) {
    const email = decodedToken.email;
    if (!email) {
      throw new ErrorAutenticacion(
        'El token de usuario no contiene un correo electrónico válido',
        400
      );
    }

    const rol: RolUsuario = 'candidato';
    const nombrePorDefecto = email.split('@')[0];
    const nombre =
      input.nombre ??
      decodedToken.name ??
      (nombrePorDefecto.length >= 2 ? nombrePorDefecto : 'Usuario');

    try {
      usuario = await crearUsuario({
        uid: decodedToken.uid,
        email,
        nombre,
        rol,
      });
      await adminAuth.setCustomUserClaims(decodedToken.uid, { rol });
    } catch (error) {
      if (error instanceof ErrorDeConflicto) {
        const usuarioExistente = await obtenerUsuarioPorUid(decodedToken.uid);
        if (!usuarioExistente) {
          throw new ErrorAutenticacion(
            'No se pudo recuperar el usuario tras conflicto de creación',
            500
          );
        }
        usuario = usuarioExistente;
      } else {
        throw error;
      }
    }
  } else if (decodedToken.rol !== usuario.rol) {
    await adminAuth.setCustomUserClaims(decodedToken.uid, { rol: usuario.rol });
  }

  const sessionCookie = await adminAuth.createSessionCookie(input.idToken, {
    expiresIn: DURACION_SESION_MS,
  });

  return {
    sessionCookie,
    usuario,
  };
}

export async function obtenerUsuarioDesdeCookie(
  sessionCookie: string
): Promise<Usuario> {
  let decodedClaims;
  try {
    decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    throw new ErrorAutenticacion('Sesión inválida o expirada', 401);
  }

  const usuario = await obtenerUsuarioPorUid(decodedClaims.uid);
  if (!usuario) {
    throw new ErrorAutenticacion('Usuario no encontrado', 401);
  }

  return usuario;
}

export async function obtenerUsuarioDesdeBearerToken(
  idToken: string
): Promise<Usuario> {
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken, true);
  } catch {
    throw new ErrorAutenticacion('Token Bearer inválido o expirado', 401);
  }

  const usuario = await obtenerUsuarioPorUid(decodedToken.uid);
  if (!usuario) {
    throw new ErrorAutenticacion('Usuario no encontrado', 401);
  }

  return usuario;
}

export async function revocarSesionPorCookie(
  sessionCookie: string
): Promise<void> {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      false
    );
    await adminAuth.revokeRefreshTokens(decodedClaims.sub);
  } catch {
    // Si la cookie ya expiró o es inválida, ignoramos el error para permitir limpiar la cookie en el cliente
  }
}

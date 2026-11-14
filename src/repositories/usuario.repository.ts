import { ErrorDeConflicto } from '@/lib/errores';
import { adminDb } from '@/lib/firebase/admin';
import { usuarioSchema } from '@/schemas/auth.schema';
import type { CrearUsuarioDatos, Usuario } from '@/types/auth.types';

const COLECCION_USUARIOS = 'usuarios';

export async function obtenerUsuarioPorUid(uid: string): Promise<Usuario | null> {
  const docSnap = await adminDb.collection(COLECCION_USUARIOS).doc(uid).get();

  if (!docSnap.exists) {
    return null;
  }

  const datos = docSnap.data();
  return usuarioSchema.parse(datos);
}

export async function crearUsuario(datos: CrearUsuarioDatos): Promise<Usuario> {
  const ahoraIso = new Date().toISOString();

  const nuevoUsuario: Usuario = {
    uid: datos.uid,
    email: datos.email,
    nombre: datos.nombre,
    rol: datos.rol,
    creadoEn: ahoraIso,
    actualizadoEn: ahoraIso,
  };

  try {
    await adminDb
      .collection(COLECCION_USUARIOS)
      .doc(datos.uid)
      .create(nuevoUsuario);
    return nuevoUsuario;
  } catch (error: unknown) {
    const err = error as { code?: number | string; message?: string };
    if (
      err?.code === 6 ||
      err?.code === 'already-exists' ||
      err?.message?.includes('ALREADY_EXISTS')
    ) {
      throw new ErrorDeConflicto('El usuario ya existe');
    }
    throw error;
  }
}

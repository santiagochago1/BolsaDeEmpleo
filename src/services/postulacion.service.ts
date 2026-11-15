import { get } from '@vercel/blob';
import { requerirRol } from '@/lib/auth';
import {
  ErrorAutenticacion,
  ErrorDeConflicto,
  ErrorNoEncontrado,
} from '@/lib/errores';
import { obtenerOfertaPorId } from '@/repositories/oferta.repository';
import {
  actualizarEstadoPostulacion,
  crearPostulacion,
  listarPostulacionesPorOferta,
  obtenerPostulacion,
} from '@/repositories/postulacion.repository';
import type {
  CrearPostulacionInput,
  EstadoPostulacion,
  PostulacionRespuesta,
} from '@/schemas/postulacion.schema';
import type { Usuario } from '@/types/auth.types';

export async function postularse(
  usuario: Usuario,
  ofertaId: string,
  datos: CrearPostulacionInput
): Promise<PostulacionRespuesta> {
  requerirRol(usuario, 'candidato');

  const oferta = await obtenerOfertaPorId(ofertaId);
  if (!oferta) {
    throw new ErrorNoEncontrado('La oferta solicitada no existe');
  }

  if (oferta.estado !== 'abierta') {
    throw new ErrorDeConflicto(
      'No es posible postularse porque la oferta está cerrada'
    );
  }

  const prefijoPermitido = `usuarios/${usuario.uid}/`;
  if (
    !datos.cvPathname.startsWith(prefijoPermitido) ||
    datos.cvPathname.includes('..') ||
    datos.cvPathname.length <= prefijoPermitido.length
  ) {
    throw new ErrorAutenticacion(
      'El archivo de CV especificado no pertenece al usuario autenticado',
      403
    );
  }

  return crearPostulacion(ofertaId, usuario.uid, {
    nombre: usuario.nombre,
    correo: usuario.email,
    cvPathname: datos.cvPathname,
  });
}

export async function listarCandidatos(
  usuario: Usuario,
  ofertaId: string
): Promise<PostulacionRespuesta[]> {
  requerirRol(usuario, 'empresa');

  const oferta = await obtenerOfertaPorId(ofertaId);
  if (!oferta) {
    throw new ErrorNoEncontrado('La oferta solicitada no existe');
  }

  if (oferta.empresaUid !== usuario.uid) {
    throw new ErrorAutenticacion(
      'No tienes permisos para ver los candidatos de una oferta ajena',
      403
    );
  }

  return listarPostulacionesPorOferta(ofertaId);
}

export async function cambiarEstadoCandidato(
  usuario: Usuario,
  ofertaId: string,
  candidatoUid: string,
  nuevoEstado: EstadoPostulacion
): Promise<PostulacionRespuesta> {
  requerirRol(usuario, 'empresa');

  const oferta = await obtenerOfertaPorId(ofertaId);
  if (!oferta) {
    throw new ErrorNoEncontrado('La oferta solicitada no existe');
  }

  if (oferta.empresaUid !== usuario.uid) {
    throw new ErrorAutenticacion(
      'No tienes permisos para modificar postulaciones de una oferta ajena',
      403
    );
  }

  const postulacion = await obtenerPostulacion(ofertaId, candidatoUid);
  if (!postulacion) {
    throw new ErrorNoEncontrado('La postulación solicitada no existe');
  }

  return actualizarEstadoPostulacion(ofertaId, candidatoUid, nuevoEstado);
}

export async function obtenerStreamCvPrivado(
  usuario: Usuario,
  ofertaId: string,
  candidatoUid: string
): Promise<ReadableStream<Uint8Array>> {
  requerirRol(usuario, 'empresa');

  const oferta = await obtenerOfertaPorId(ofertaId);
  if (!oferta) {
    throw new ErrorNoEncontrado('La oferta asociada no existe');
  }

  if (oferta.empresaUid !== usuario.uid) {
    throw new ErrorAutenticacion(
      'No tienes permisos para descargar el CV de una oferta ajena',
      403
    );
  }

  const postulacion = await obtenerPostulacion(ofertaId, candidatoUid);
  if (!postulacion) {
    throw new ErrorNoEncontrado('La postulación solicitada no existe');
  }

  const resultadoBlob = await get(postulacion.cvPathname, {
    access: 'private',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  if (
    !resultadoBlob ||
    resultadoBlob.statusCode !== 200 ||
    !resultadoBlob.stream
  ) {
    throw new ErrorNoEncontrado(
      'El archivo PDF del CV no se encontró en el almacenamiento privado'
    );
  }

  return resultadoBlob.stream;
}

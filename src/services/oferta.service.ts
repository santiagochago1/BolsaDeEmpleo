import { requerirRol } from '@/lib/auth';
import { ErrorAutenticacion, ErrorNoEncontrado } from '@/lib/errores';
import {
  cerrarOferta as cerrarOfertaRepo,
  crearOferta as crearOfertaRepo,
  listarOfertas as listarOfertasRepo,
  obtenerOfertaPorId,
} from '@/repositories/oferta.repository';
import {
  type CrearOfertaInput,
  type FiltrosOferta,
  type OfertaRespuesta,
  type ResultadoPaginadoOfertas,
} from '@/schemas/oferta.schema';
import type { Usuario } from '@/types/auth.types';

const LIMITE_POR_DEFECTO = 20;
const LIMITE_MAXIMO = 100;
const LIMITE_MINIMO = 1;

export async function crearOferta(
  usuario: Usuario,
  datos: CrearOfertaInput
): Promise<OfertaRespuesta> {
  requerirRol(usuario, 'empresa');
  return crearOfertaRepo(datos, usuario.uid);
}

export async function listarOfertas(
  filtros: FiltrosOferta = {},
  limite?: number,
  cursor?: string
): Promise<ResultadoPaginadoOfertas> {
  let limiteNormalizado = LIMITE_POR_DEFECTO;

  if (typeof limite === 'number' && !Number.isNaN(limite)) {
    limiteNormalizado = Math.min(
      Math.max(Math.trunc(limite), LIMITE_MINIMO),
      LIMITE_MAXIMO
    );
  }

  const cursorLimpio = cursor?.trim() ? cursor.trim() : undefined;
  return listarOfertasRepo(filtros, limiteNormalizado, cursorLimpio);
}

export async function obtenerOferta(id: string): Promise<OfertaRespuesta> {
  const oferta = await obtenerOfertaPorId(id);

  if (!oferta) {
    throw new ErrorNoEncontrado('La oferta solicitada no existe');
  }

  return oferta;
}

export async function cerrarOferta(
  usuario: Usuario,
  ofertaId: string
): Promise<OfertaRespuesta> {
  requerirRol(usuario, 'empresa');

  const oferta = await obtenerOfertaPorId(ofertaId);
  if (!oferta) {
    throw new ErrorNoEncontrado('La oferta solicitada no existe');
  }

  if (oferta.empresaUid !== usuario.uid) {
    throw new ErrorAutenticacion(
      'No tienes permisos para cerrar una oferta de otra empresa',
      403
    );
  }

  return cerrarOfertaRepo(ofertaId);
}

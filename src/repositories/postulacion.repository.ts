import { ErrorDeConflicto } from '@/lib/errores';
import { adminDb } from '@/lib/firebase/admin';
import {
  type CrearPostulacionDatosRepo,
  type EstadoPostulacion,
  type PostulacionRespuesta,
  postulacionRespuestaSchema,
} from '@/schemas/postulacion.schema';

const COLECCION_OFERTAS = 'ofertas';
const SUBCOLECCION_POSTULACIONES = 'postulaciones';

function normalizarFechaIso(valor: unknown): string {
  if (typeof valor === 'string') {
    return valor;
  }
  if (
    valor &&
    typeof valor === 'object' &&
    'toDate' in valor &&
    typeof (valor as { toDate: () => Date }).toDate === 'function'
  ) {
    return (valor as { toDate: () => Date }).toDate().toISOString();
  }
  if (valor instanceof Date) {
    return valor.toISOString();
  }
  return new Date().toISOString();
}

function normalizarPostulacion(
  ofertaId: string,
  candidatoUid: string,
  datos: FirebaseFirestore.DocumentData
): PostulacionRespuesta {
  return postulacionRespuestaSchema.parse({
    id: candidatoUid,
    candidatoUid: datos.candidatoUid ?? candidatoUid,
    ofertaId: datos.ofertaId ?? ofertaId,
    nombre: datos.nombre,
    correo: datos.correo,
    cvPathname: datos.cvPathname,
    estado: datos.estado,
    creadaEn: normalizarFechaIso(datos.creadaEn),
  });
}

function obtenerReferenciaPostulaciones(ofertaId: string) {
  return adminDb
    .collection(COLECCION_OFERTAS)
    .doc(ofertaId)
    .collection(SUBCOLECCION_POSTULACIONES);
}

export async function crearPostulacion(
  ofertaId: string,
  candidatoUid: string,
  datos: CrearPostulacionDatosRepo
): Promise<PostulacionRespuesta> {
  const creadaEn = new Date().toISOString();

  const nuevaPostulacion = {
    candidatoUid,
    ofertaId,
    nombre: datos.nombre,
    correo: datos.correo,
    cvPathname: datos.cvPathname,
    estado: 'recibido' as const,
    creadaEn,
  };

  try {
    await obtenerReferenciaPostulaciones(ofertaId)
      .doc(candidatoUid)
      .create(nuevaPostulacion);

    return normalizarPostulacion(ofertaId, candidatoUid, nuevaPostulacion);
  } catch (error: unknown) {
    const err = error as { code?: number | string; message?: string };
    if (
      err?.code === 6 ||
      err?.code === 'already-exists' ||
      err?.message?.includes('ALREADY_EXISTS')
    ) {
      throw new ErrorDeConflicto('Ya existe una postulación para esta oferta');
    }
    throw error;
  }
}

export async function obtenerPostulacion(
  ofertaId: string,
  candidatoUid: string
): Promise<PostulacionRespuesta | null> {
  const docSnap = await obtenerReferenciaPostulaciones(ofertaId)
    .doc(candidatoUid)
    .get();

  if (!docSnap.exists) {
    return null;
  }

  const datos = docSnap.data();
  if (!datos) {
    return null;
  }

  return normalizarPostulacion(ofertaId, docSnap.id, datos);
}

export async function listarPostulacionesPorOferta(
  ofertaId: string
): Promise<PostulacionRespuesta[]> {
  const snapshot = await obtenerReferenciaPostulaciones(ofertaId)
    .orderBy('creadaEn', 'desc')
    .get();

  return snapshot.docs.map((doc) =>
    normalizarPostulacion(ofertaId, doc.id, doc.data())
  );
}

export async function actualizarEstadoPostulacion(
  ofertaId: string,
  candidatoUid: string,
  nuevoEstado: EstadoPostulacion
): Promise<PostulacionRespuesta> {
  const docRef = obtenerReferenciaPostulaciones(ofertaId).doc(candidatoUid);
  await docRef.update({ estado: nuevoEstado });

  const docActualizado = await docRef.get();
  if (!docActualizado.exists || !docActualizado.data()) {
    throw new Error('No se encontró la postulación tras actualizar su estado');
  }

  return normalizarPostulacion(
    ofertaId,
    docActualizado.id,
    docActualizado.data()!
  );
}

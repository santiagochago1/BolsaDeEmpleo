import { adminDb } from '@/lib/firebase/admin';
import {
  type CrearOfertaInput,
  type FiltrosOferta,
  type OfertaRespuesta,
  ofertaRespuestaSchema,
  type ResultadoPaginadoOfertas,
} from '@/schemas/oferta.schema';

const COLECCION_OFERTAS = 'ofertas';

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

function normalizarOferta(
  id: string,
  datos: FirebaseFirestore.DocumentData
): OfertaRespuesta {
  return ofertaRespuestaSchema.parse({
    id,
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    ciudad: datos.ciudad,
    modalidad: datos.modalidad,
    area: datos.area,
    empresaUid: datos.empresaUid,
    estado: datos.estado,
    creadaEn: normalizarFechaIso(datos.creadaEn),
  });
}

export async function crearOferta(
  datos: CrearOfertaInput,
  empresaUid: string
): Promise<OfertaRespuesta> {
  const creadaEn = new Date().toISOString();
  const docRef = adminDb.collection(COLECCION_OFERTAS).doc();

  const nuevaOfertaSinId = {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    ciudad: datos.ciudad,
    modalidad: datos.modalidad,
    area: datos.area,
    empresaUid,
    estado: 'abierta' as const,
    creadaEn,
  };

  await docRef.set(nuevaOfertaSinId);

  return normalizarOferta(docRef.id, nuevaOfertaSinId);
}

export async function obtenerOfertaPorId(
  id: string
): Promise<OfertaRespuesta | null> {
  const docSnap = await adminDb.collection(COLECCION_OFERTAS).doc(id).get();

  if (!docSnap.exists) {
    return null;
  }

  const datos = docSnap.data();
  if (!datos) {
    return null;
  }

  return normalizarOferta(docSnap.id, datos);
}

export async function listarOfertas(
  filtros: FiltrosOferta = {},
  limite = 20,
  cursor?: string
): Promise<ResultadoPaginadoOfertas> {
  let query: FirebaseFirestore.Query = adminDb
    .collection(COLECCION_OFERTAS)
    .where('estado', '==', 'abierta');

  if (filtros.modalidad) {
    query = query.where('modalidad', '==', filtros.modalidad);
  }

  if (filtros.ciudad) {
    query = query.where('ciudad', '==', filtros.ciudad);
  }

  query = query.orderBy('creadaEn', 'desc');

  if (cursor) {
    query = query.startAfter(cursor);
  }

  const snapshot = await query.limit(limite).get();

  const items = snapshot.docs.map((doc) =>
    normalizarOferta(doc.id, doc.data())
  );

  const siguienteCursor =
    items.length === limite ? items[items.length - 1].creadaEn : null;

  return {
    items,
    siguienteCursor,
  };
}

export async function cerrarOferta(id: string): Promise<OfertaRespuesta> {
  const docRef = adminDb.collection(COLECCION_OFERTAS).doc(id);
  await docRef.update({ estado: 'cerrada' });

  const docActualizado = await docRef.get();
  if (!docActualizado.exists || !docActualizado.data()) {
    throw new Error('No se encontró la oferta tras actualizar su estado');
  }

  return normalizarOferta(docActualizado.id, docActualizado.data()!);
}

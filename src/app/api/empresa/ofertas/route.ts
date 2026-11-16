import { NextResponse } from 'next/server';
import { requerirRol, requerirUsuario } from '@/lib/auth';
import { manejar } from '@/lib/errores';
import { adminDb } from '@/lib/firebase/admin';
import type { OfertaRespuesta } from '@/schemas/oferta.schema';
export const dynamic = 'force-dynamic';

export const GET = manejar(async (request: Request): Promise<Response> => {
  const usuario = await requerirUsuario(request);
  requerirRol(usuario, 'empresa');

  const snapshot = await adminDb
    .collection('ofertas')
    .where('empresaUid', '==', usuario.uid)
    .get();

  const items: OfertaRespuesta[] = snapshot.docs.map((doc) => {
    const datos = doc.data();
    return {
      id: doc.id,
      titulo: datos.titulo ?? '',
      descripcion: datos.descripcion ?? '',
      ciudad: datos.ciudad ?? '',
      modalidad: datos.modalidad ?? 'presencial',
      area: datos.area ?? '',
      empresaUid: datos.empresaUid ?? usuario.uid,
      estado: datos.estado ?? 'abierta',
      creadaEn:
        typeof datos.creadaEn === 'string'
          ? datos.creadaEn
          : new Date().toISOString(),
    };
  });

  items.sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));

  return NextResponse.json(
    { items },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
});

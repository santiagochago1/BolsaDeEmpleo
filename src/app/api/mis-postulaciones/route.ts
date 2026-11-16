export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requerirRol, requerirUsuario } from '@/lib/auth';
import { manejar } from '@/lib/errores';
import { adminDb } from '@/lib/firebase/admin';
import type { EstadoPostulacion } from '@/schemas/postulacion.schema';


export interface MiPostulacionItem {
  id: string;
  ofertaId: string;
  candidatoUid: string;
  tituloOferta: string;
  ciudadOferta: string;
  estado: EstadoPostulacion;
  cvPathname: string;
  creadaEn: string;
}

export const GET = manejar(async (request: Request): Promise<Response> => {
  const usuario = await requerirUsuario(request);
  requerirRol(usuario, 'candidato');

  const snapshot = await adminDb
    .collectionGroup('postulaciones')
    .where('candidatoUid', '==', usuario.uid)
    .get();

  const items: MiPostulacionItem[] = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const datos = doc.data();
      const ofertaRef = doc.ref.parent.parent;
      const ofertaId = datos.ofertaId ?? ofertaRef?.id ?? '';

      let tituloOferta = 'Oferta de empleo';
      let ciudadOferta = '';

      if (ofertaRef) {
        const ofertaSnap = await ofertaRef.get();
        if (ofertaSnap.exists) {
          const datosOferta = ofertaSnap.data();
          tituloOferta = datosOferta?.titulo ?? tituloOferta;
          ciudadOferta = datosOferta?.ciudad ?? '';
        }
      }

      const creadaEn =
        typeof datos.creadaEn === 'string'
          ? datos.creadaEn
          : new Date().toISOString();

      return {
        id: doc.id,
        ofertaId,
        candidatoUid: datos.candidatoUid ?? usuario.uid,
        tituloOferta,
        ciudadOferta,
        estado: (datos.estado ?? 'recibido') as EstadoPostulacion,
        cvPathname: datos.cvPathname ?? '',
        creadaEn,
      };
    })
  );

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

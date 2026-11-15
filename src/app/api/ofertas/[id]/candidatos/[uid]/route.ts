import { NextResponse } from 'next/server';
import { requerirUsuario, verificarOrigen } from '@/lib/auth';
import { manejar } from '@/lib/errores';
import { cambiarEstadoPostulacionSchema } from '@/schemas/postulacion.schema';
import { cambiarEstadoCandidato } from '@/services/postulacion.service';

export interface RouteContextOfertaCandidatoUid {
  params:
    | Promise<{ id: string; uid: string }>
    | { id: string; uid: string };
}

export const PATCH = manejar<RouteContextOfertaCandidatoUid>(
  async (
    request: Request,
    context: RouteContextOfertaCandidatoUid
  ): Promise<Response> => {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { id: ofertaId, uid: candidatoUid } = await context.params;

    const body = await request.json();
    const { estado } = cambiarEstadoPostulacionSchema.parse(body);

    const postulacionActualizada = await cambiarEstadoCandidato(
      usuario,
      ofertaId,
      candidatoUid,
      estado
    );

    return NextResponse.json(postulacionActualizada, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
);

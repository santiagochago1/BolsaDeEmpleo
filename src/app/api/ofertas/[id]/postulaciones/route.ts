import { NextResponse } from 'next/server';
import { requerirUsuario, verificarOrigen } from '@/lib/auth';
import { manejar } from '@/lib/errores';
import { crearPostulacionSchema } from '@/schemas/postulacion.schema';
import { postularse } from '@/services/postulacion.service';

export interface RouteContextOfertaPostulacion {
  params: Promise<{ id: string }> | { id: string };
}

export const POST = manejar<RouteContextOfertaPostulacion>(
  async (
    request: Request,
    context: RouteContextOfertaPostulacion
  ): Promise<Response> => {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { id: ofertaId } = await context.params;

    const body = await request.json();
    const datos = crearPostulacionSchema.parse(body);

    const postulacion = await postularse(usuario, ofertaId, datos);

    return NextResponse.json(postulacion, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
);

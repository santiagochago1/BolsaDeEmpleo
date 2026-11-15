import { NextResponse } from 'next/server';
import { requerirUsuario } from '@/lib/auth';
import { manejar } from '@/lib/errores';
import { listarCandidatos } from '@/services/postulacion.service';

export interface RouteContextOfertaCandidatos {
  params: Promise<{ id: string }> | { id: string };
}

export const GET = manejar<RouteContextOfertaCandidatos>(
  async (
    request: Request,
    context: RouteContextOfertaCandidatos
  ): Promise<Response> => {
    const usuario = await requerirUsuario(request);
    const { id: ofertaId } = await context.params;

    const candidatos = await listarCandidatos(usuario, ofertaId);

    return NextResponse.json(candidatos, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
);

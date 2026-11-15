import { NextResponse } from 'next/server';
import { requerirUsuario, verificarOrigen } from '@/lib/auth';
import { manejar } from '@/lib/errores';
import { cerrarOferta, obtenerOferta } from '@/services/oferta.service';

export interface RouteContextOfertaId {
  params: Promise<{ id: string }> | { id: string };
}

export const GET = manejar<RouteContextOfertaId>(
  async (_request: Request, context: RouteContextOfertaId): Promise<Response> => {
    const { id } = await context.params;
    const oferta = await obtenerOferta(id);

    return NextResponse.json(oferta, { status: 200 });
  }
);

export const PATCH = manejar<RouteContextOfertaId>(
  async (request: Request, context: RouteContextOfertaId): Promise<Response> => {
    verificarOrigen(request);
    const usuario = await requerirUsuario(request);
    const { id } = await context.params;

    const ofertaCerrada = await cerrarOferta(usuario, id);

    return NextResponse.json(ofertaCerrada, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
);

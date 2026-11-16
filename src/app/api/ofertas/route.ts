export const dynamic = 'force-dynamic';
import { connection, NextResponse } from 'next/server';
import { requerirRol, requerirUsuario, verificarOrigen } from '@/lib/auth';
import { manejar } from '@/lib/errores';
import {
  crearOfertaSchema,
  type FiltrosOferta,
  modalidadOfertaSchema,
} from '@/schemas/oferta.schema';
import { crearOferta, listarOfertas } from '@/services/oferta.service';

export const GET = manejar(async (request: Request): Promise<Response> => {
  await connection();
  const { searchParams } = new URL(request.url);

  const modalidadParam = searchParams.get('modalidad');
  const ciudadParam = searchParams.get('ciudad');
  const limiteParam = searchParams.get('limite');
  const cursorParam = searchParams.get('cursor');

  const filtros: FiltrosOferta = {};

  if (modalidadParam !== null && modalidadParam.trim() !== '') {
    filtros.modalidad = modalidadOfertaSchema.parse(modalidadParam.trim());
  }

  if (ciudadParam !== null && ciudadParam.trim() !== '') {
    filtros.ciudad = ciudadParam.trim();
  }

  const limite =
    limiteParam !== null && limiteParam.trim() !== ''
      ? Number(limiteParam)
      : undefined;

  const cursor =
    cursorParam !== null && cursorParam.trim() !== ''
      ? cursorParam.trim()
      : undefined;

  const resultado = await listarOfertas(filtros, limite, cursor);

  return NextResponse.json(resultado, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
});

export const POST = manejar(async (request: Request): Promise<Response> => {
  verificarOrigen(request);
  const usuario = await requerirUsuario(request);
  requerirRol(usuario, 'empresa');

  const body = await request.json();
  const datos = crearOfertaSchema.parse(body);

  const ofertaCreada = await crearOferta(usuario, datos);

  return NextResponse.json(ofertaCreada, {
    status: 201,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
});

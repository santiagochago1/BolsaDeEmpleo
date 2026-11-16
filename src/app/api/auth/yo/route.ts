import { NextResponse } from 'next/server';
import { requerirUsuario } from '@/lib/auth';
import { manejar } from '@/lib/errores';
export const dynamic = 'force-dynamic';

export const GET = manejar(async (request: Request): Promise<Response> => {
  const usuario = await requerirUsuario(request);

  return NextResponse.json(
  { usuario: { uid: usuario.uid, correo: usuario.email, rol: usuario.rol } },
  { status: 200 }
);
});

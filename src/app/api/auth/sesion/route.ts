import { extraerCookie, verificarOrigen } from '@/lib/auth';
import { manejar } from '@/lib/errores';
import { crearSesionSchema } from '@/schemas/auth.schema';
import {
  DURACION_SESION_SEGUNDOS,
  iniciarSesionConToken,
  NOMBRE_COOKIE_SESION,
  revocarSesionPorCookie,
} from '@/services/auth.service';

function construirCabeceraCookie(valor: string, maxAgeSegundos: number): string {
  const atributos = [
    `${NOMBRE_COOKIE_SESION}=${valor}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAgeSegundos}`,
  ];

  if (process.env.NODE_ENV === 'production') {
    atributos.push('Secure');
  }

  return atributos.join('; ');
}

export const POST = manejar(async (request: Request): Promise<Response> => {
  verificarOrigen(request);
  const body = await request.json();
  const datos = crearSesionSchema.parse(body);

  const { sessionCookie } = await iniciarSesionConToken(datos);

  return new Response(null, {
    status: 204,
    headers: {
      'Set-Cookie': construirCabeceraCookie(
        sessionCookie,
        DURACION_SESION_SEGUNDOS
      ),
    },
  });
});

export const DELETE = manejar(async (request: Request): Promise<Response> => {
  verificarOrigen(request);

  const cookieHeader = request.headers.get('cookie');
  const cookieSesion = extraerCookie(cookieHeader, NOMBRE_COOKIE_SESION);

  if (cookieSesion) {
    await revocarSesionPorCookie(cookieSesion);
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Set-Cookie': construirCabeceraCookie('', 0),
    },
  });
});

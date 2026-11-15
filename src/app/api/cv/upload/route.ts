import { type HandleUploadBody, handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { requerirRol, requerirUsuario, verificarOrigen } from '@/lib/auth';
import { ErrorAutenticacion, manejar } from '@/lib/errores';

const TAMANO_MAXIMO_CV_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST = manejar(async (request: Request): Promise<Response> => {
  verificarOrigen(request);

  const body = (await request.json()) as HandleUploadBody;

  const respuesta = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname: string) => {
      const usuario = await requerirUsuario(request);
      requerirRol(usuario, 'candidato');

      const prefijoEsperado = `usuarios/${usuario.uid}/`;
      if (
        !pathname.startsWith(prefijoEsperado) ||
        pathname.includes('..') ||
        pathname.length <= prefijoEsperado.length
      ) {
        throw new ErrorAutenticacion(
          'El pathname del archivo debe iniciar con usuarios/<uid>/',
          403
        );
      }

      return {
        allowedContentTypes: ['application/pdf'],
        maximumSizeInBytes: TAMANO_MAXIMO_CV_BYTES,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ uid: usuario.uid }),
      };
    },
    onUploadCompleted: async () => {
      // El registro definitivo en Firestore ocurre cuando el candidato envía POST /api/ofertas/[id]/postulaciones
    },
  });

  return NextResponse.json(respuesta, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
});

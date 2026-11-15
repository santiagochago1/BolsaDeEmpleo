import { requerirUsuario } from '@/lib/auth';
import { ErrorAutenticacion, manejar } from '@/lib/errores';
import { obtenerStreamCvPrivado } from '@/services/postulacion.service';

export interface RouteContextPostulacionCv {
  params: Promise<{ id: string }> | { id: string };
}

export const GET = manejar<RouteContextPostulacionCv>(
  async (
    request: Request,
    context: RouteContextPostulacionCv
  ): Promise<Response> => {
    const usuario = await requerirUsuario(request);
    const { id: ofertaId } = await context.params;
    const { searchParams } = new URL(request.url);

    const candidatoUid = searchParams.get('candidatoUid')?.trim();
    if (!candidatoUid) {
      throw new ErrorAutenticacion(
        'El parámetro de consulta candidatoUid es obligatorio',
        400
      );
    }

    const stream = await obtenerStreamCvPrivado(
      usuario,
      ofertaId,
      candidatoUid
    );

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="cv.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  }
);

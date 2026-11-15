import { z } from 'zod';

export const estadoPostulacionSchema = z.enum(
  ['recibido', 'en revisión', 'entrevista', 'rechazado', 'contratado'],
  {
    message:
      "El estado debe ser 'recibido', 'en revisión', 'entrevista', 'rechazado' o 'contratado'",
  }
);

export const crearPostulacionSchema = z.strictObject({
  cvPathname: z
    .string()
    .trim()
    .min(1, 'El cvPathname es obligatorio')
    .refine((val) => val.startsWith('usuarios/'), {
      message: "El cvPathname debe comenzar con 'usuarios/'",
    })
    .refine((val) => !val.includes('..'), {
      message: 'El cvPathname contiene una secuencia de ruta no permitida',
    })
    .refine((val) => val.toLowerCase().endsWith('.pdf'), {
      message: 'El archivo del CV debe tener extensión .pdf',
    }),
});

export const CrearPostulacionSchema = crearPostulacionSchema;

export const cambiarEstadoPostulacionSchema = z.strictObject({
  estado: estadoPostulacionSchema,
});

export const CambiarEstadoPostulacionSchema = cambiarEstadoPostulacionSchema;

export const postulacionRespuestaSchema = z.strictObject({
  id: z.string().min(1),
  candidatoUid: z.string().min(1),
  ofertaId: z.string().min(1),
  nombre: z.string().min(1),
  correo: z.email('El correo electrónico no es válido'),
  cvPathname: z.string().min(1),
  estado: estadoPostulacionSchema,
  creadaEn: z.iso.datetime({ offset: true }),
});

export const PostulacionRespuestaSchema = postulacionRespuestaSchema;

export type EstadoPostulacion = z.infer<typeof estadoPostulacionSchema>;
export type CrearPostulacionInput = z.infer<typeof crearPostulacionSchema>;
export type CambiarEstadoPostulacionInput = z.infer<
  typeof cambiarEstadoPostulacionSchema
>;
export type PostulacionRespuesta = z.infer<typeof postulacionRespuestaSchema>;

export interface CrearPostulacionDatosRepo {
  nombre: string;
  correo: string;
  cvPathname: string;
}

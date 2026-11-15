import { z } from 'zod';

export const modalidadOfertaSchema = z.enum(
  ['presencial', 'remoto', 'hibrido'],
  {
    message: "La modalidad debe ser 'presencial', 'remoto' o 'hibrido'",
  }
);

export const estadoOfertaSchema = z.enum(['abierta', 'cerrada'], {
  message: "El estado debe ser 'abierta' o 'cerrada'",
});

export const crearOfertaSchema = z.strictObject({
  titulo: z
    .string()
    .trim()
    .min(5, 'El título debe tener al menos 5 caracteres'),
  descripcion: z
    .string()
    .trim()
    .min(1, 'La descripción no puede estar vacía')
    .max(2000, 'La descripción no puede superar los 2000 caracteres'),
  ciudad: z.string().trim().min(1, 'La ciudad es obligatoria'),
  modalidad: modalidadOfertaSchema,
  area: z.string().trim().min(1, 'El área es obligatoria'),
});

export const CrearOfertaSchema = crearOfertaSchema;

export const ofertaRespuestaSchema = z.strictObject({
  id: z.string().min(1),
  titulo: z.string().min(5),
  descripcion: z.string().min(1).max(2000),
  ciudad: z.string().min(1),
  modalidad: modalidadOfertaSchema,
  area: z.string().min(1),
  empresaUid: z.string().min(1),
  estado: estadoOfertaSchema,
  creadaEn: z.iso.datetime({ offset: true }),
});

export const OfertaRespuestaSchema = ofertaRespuestaSchema;

export type ModalidadOferta = z.infer<typeof modalidadOfertaSchema>;
export type EstadoOferta = z.infer<typeof estadoOfertaSchema>;
export type CrearOfertaInput = z.infer<typeof crearOfertaSchema>;
export type OfertaRespuesta = z.infer<typeof ofertaRespuestaSchema>;

export interface FiltrosOferta {
  modalidad?: ModalidadOferta;
  ciudad?: string;
}

export interface ResultadoPaginadoOfertas {
  items: OfertaRespuesta[];
  siguienteCursor: string | null;
}

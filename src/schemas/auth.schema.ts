import { z } from 'zod';

export const rolUsuarioSchema = z.enum(['candidato', 'empresa'], {
  error: "El rol debe ser 'candidato' o 'empresa'",
});

export const crearSesionSchema = z.strictObject({
  idToken: z.string().min(1, 'El idToken es obligatorio'),
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .optional(),
});

export const usuarioSchema = z.strictObject({
  uid: z.string().min(1),
  email: z.email('El correo electrónico no es válido'),
  nombre: z.string().min(2).max(100),
  rol: rolUsuarioSchema,
  creadoEn: z.iso.datetime({ offset: true }),
  actualizadoEn: z.iso.datetime({ offset: true }),
});

import { z } from 'zod';
import {
  rolUsuarioSchema,
  crearSesionSchema,
  usuarioSchema,
} from '@/schemas/auth.schema';

export type RolUsuario = z.infer<typeof rolUsuarioSchema>;

export type CrearSesionInput = z.infer<typeof crearSesionSchema>;

export type Usuario = z.infer<typeof usuarioSchema>;

export interface CrearUsuarioDatos {
  uid: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

export interface ResultadoSesion {
  sessionCookie: string;
  usuario: Usuario;
}

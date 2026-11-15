import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ErrorAutenticacion extends Error {
  public readonly codigoEstado: number;
  public readonly detalles: string[];

  constructor(mensaje: string, codigoEstado = 401, detalles: string[] = []) {
    super(mensaje);
    this.name = 'ErrorAutenticacion';
    this.codigoEstado = codigoEstado;
    this.detalles = detalles;
  }
}

export class ErrorDeConflicto extends Error {
  public readonly codigoEstado = 409;
  public readonly detalles: string[];

  constructor(mensaje: string, detalles: string[] = []) {
    super(mensaje);
    this.name = 'ErrorDeConflicto';
    this.detalles = detalles;
  }
}

export type RouteHandler<TContext = unknown> = (
  request: Request,
  context: TContext
) => Promise<Response>;

export function manejar<TContext = unknown>(
  handler: RouteHandler<TContext>
): RouteHandler<TContext> {
  return async (request: Request, context: TContext): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const detalles = error.issues.map((issue) => {
          const ruta = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
          return `${ruta}${issue.message}`;
        });

        return NextResponse.json(
          {
            error: 'Datos de entrada inválidos',
            detalles,
          },
          { status: 400 }
        );
      }

      if (error instanceof ErrorAutenticacion) {
        return NextResponse.json(
          {
            error: error.message,
            detalles: error.detalles,
          },
          { status: error.codigoEstado }
        );
      }

      if (error instanceof ErrorDeConflicto) {
        return NextResponse.json(
          {
            error: error.message,
            detalles: error.detalles,
          },
          { status: error.codigoEstado }
        );
      }

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            error: 'El cuerpo de la petición no es un JSON válido',
            detalles: [],
          },
          { status: 400 }
        );
      }

      const idCorrelacion = crypto.randomUUID();
      console.error(`[Error 500 | ID: ${idCorrelacion}]`, error);

      return NextResponse.json(
        {
          error: 'Error interno del servidor',
          detalles: [`ID de correlación: ${idCorrelacion}`],
        },
        { status: 500 }
      );
    }
  };
}



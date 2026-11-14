# Reglas del Proyecto: Bolsa de Empleo

## 1. Stack y Comandos
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript.
- **Estilos:** Tailwind CSS v4.
- **Validación:** Zod (v4).
- **Backend:** Firebase Admin SDK + Firestore (solo servidor).
- **Archivos:** Vercel Blob (Store privado).
- **Pruebas:** Vitest + React Testing Library.
- **Comandos:**
  - Desarrollo: `npm run dev`
  - Pruebas: `npm run test`
  - Lint: `npm run lint`

## 2. Arquitectura y Estructura (CRÍTICO)
- **Capas:** Route Handler (HTTP/Zod) → Servicio (Reglas de negocio) → Repositorio (Firestore).
- **Prohibido:** NO importar `firebase/firestore` en el cliente. El navegador solo usa `firebase/auth`.
- **Estructura:** `src/app`, `src/components`, `src/hooks`, `src/lib`, `src/repositories`, `src/schemas`, `src/services`.
- **Server Components:** Por defecto. Usa `"use client"` solo para estado/efectos.

## 3. Reglas de Seguridad (NO NEGOCIABLES)
- **Secretos:** NUNCA leer archivos `.env*` ni claves privadas.
- **Firestore:** Reglas deben ser `allow read, write: if false;`.
- **Auth:** La cookie de sesión debe ser `HttpOnly`, `Secure`, `SameSite=Lax`.
- **Autorización:** Cada ruta privada debe verificar sesión y rol (candidato/empresa).
- **Archivos:** Validar tipo PDF y tamaño máximo (5MB) en el servidor.

## 4. Reglas de Código
- **Validación:** Usa Zod en modo estricto (rechaza campos desconocidos).
- **Fechas:** ISO 8601 UTC. Dinero en centavos.
- **Errores:** Formato `{ "error": "mensaje", "detalles": [...] }`.
- **Accesibilidad:** HTML semántico, foco visible, contraste AA.

## 5. Flujo de Trabajo con la IA (OBLIGATORIO)
- **TRABAJA POR PASOS:** No generes bloques gigantes de código de una vez. Haz un solo archivo o una sola función a la vez.
- **PIDE PERMISO:** Antes de modificar múltiples archivos, explica tu plan y espera confirmación.
- **NO HAGAS COMMITS:** Tienes estrictamente prohibido ejecutar `git commit`, `git add` o cualquier comando de Git que altere el historial. El control de versiones lo hace el humano.
- **EXPLICA EL CÓDIGO:** Cada vez que generes código, añade un breve resumen de qué hace y por qué se tomó esa decisión.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Rutas públicas ────────────────────────────────────────────────────────────
// Estas rutas son accesibles SIN autenticación.
// Cualquier otra ruta que pase el matcher será protegida.
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/callback",
  "/forgot-password",
  "/reset-password",
  "/access-denied",
];

/**
 * Verifica si el pathname actual coincide con alguna ruta pública.
 * Hace match exacto y también soporta prefijos para rutas dinámicas
 * como /reset-password?token=...
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => {
    // Match exacto
    if (pathname === publicPath) return true;
    // Match de prefijo para sub-rutas (ej: /auth/callback?code=...)
    if (pathname.startsWith(publicPath + "/")) return true;
    return false;
  });
}

// ─── Middleware ─────────────────────────────────────────────────────────────────
//
// ¿Por qué middleware y no localStorage?
// ──────────────────────────────────────
// Next.js middleware corre en Edge Runtime (V8 Isolates), antes de que el
// navegador procese la página. En este entorno:
//   - NO existe window, document, ni localStorage.
//   - SOLO se puede leer de cookies (vienen en el header de la request).
//   - Es la ÚNICA manera de proteger rutas server-side sin flicker en la UI.
//
// El token DEBE estar en una cookie HttpOnly (ya lo hace nuestro backend
// en /auth/set-session) para que:
//   1. Viaje automáticamente en cada request (incluidas las de navegación).
//   2. Sea invisible a JavaScript (protección contra XSS).
//   3. Sea legible por el middleware del Edge.
//
// ¿Qué pasa con tokens expirados?
// ────────────────────────────────
// Este middleware solo verifica EXISTENCIA del token, no su validez.
// La validación real la hace el backend (requireAuth middleware).
// Si el token está expirado:
//   1. El backend responde 401.
//   2. apiClient.ts dispara el evento "um-unauthorized".
//   3. AuthContext captura el evento, limpia sesión, y redirige a /login.
// Esto es intencional: mantiene el middleware ultra-rápido (sin crypto en Edge)
// y delega la lógica pesada al backend.
//

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Dejar pasar rutas públicas ──────────────────────────────────────────
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ── 2. Verificar presencia del token ───────────────────────────────────────
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    // Sin token → redirigir a login con la URL original como parámetro
    // para poder redirigir al usuario de vuelta después del login.
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Token presente → continuar ─────────────────────────────────────────
  return NextResponse.next();
}

// ─── Matcher ───────────────────────────────────────────────────────────────────
// Excluimos del middleware:
//   - _next/static  → bundles JS/CSS de Next.js
//   - _next/image   → optimizador de imágenes de Next.js
//   - favicon.ico   → favicon del navegador
//   - images/       → assets estáticos del directorio public/images
//   - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp → archivos de imagen
//   - api/          → API routes (si existen)
//
// El matcher usa expresión negativa: "matchea todo EXCEPTO estos patrones".
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets (images, icons, etc.)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon\\.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
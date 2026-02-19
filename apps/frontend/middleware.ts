import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Capa 1 de protección de rutas (Edge Runtime).
 *
 * Solo verifica la PRESENCIA de la cookie access_token.
 * La validación real del token ocurre en la capa 2 (useRequireAuth → GET /auth/me).
 *
 * Si no hay cookie → redirige a /auth/login.
 * Si hay cookie → deja pasar (la capa 2 se encargará de validar).
 */
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    // Guardar la URL de destino para redirigir después del login (opcional)
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/marketplace/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}

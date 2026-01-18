import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas
  if (pathname === '/' || pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Middleware base (sin lógica real no la pide  aun)
  const isAuthenticated = false

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}

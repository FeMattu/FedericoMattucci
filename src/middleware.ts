import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

// Il middleware di next-intl per l'internazionalizzazione
const intlMiddleware = createMiddleware(routing);

// Middleware personalizzato che combina autenticazione e internazionalizzazione
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Gestione percorsi admin
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request });
    
    // Esclude il percorso di login dalla protezione
    if (pathname === '/admin/login') {
      // Se l'utente è già autenticato, redirect alla dashboard
      if (token) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }
    
    // Protezione percorsi admin, redirect a login se non autenticato
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Verifica se l'utente ha il ruolo admin (opzionale, per protezione aggiuntiva)
    // if (token.role !== 'admin') {
    //   return NextResponse.redirect(new URL('/admin/login', request.url));
    // }
    
    return NextResponse.next();
  }
  
  // Per tutti gli altri percorsi, usa il middleware di internazionalizzazione
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
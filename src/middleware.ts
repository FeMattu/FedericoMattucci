import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
/*
// Protected routes that require authentication
const protectedRoutes = ["/admin"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes, static files, and NextAuth routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vercel/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Apply internationalization middleware first
  const intlResponse = intlMiddleware(req);
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.match(new RegExp(`^/(?:[a-z]{2}/)?${route.replace(/^\//, '')}(/|$)`))
  );

  if (isProtectedRoute) {
    // Apply auth middleware for protected routes
    const session = await auth(req);
    
    if (!session) {
      // Extract locale from pathname if it exists
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
      
      // Redirect to login page with locale
      const loginUrl = new URL(`/${locale}/admin/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlResponse || NextResponse.next();
}*/

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|_next/static|_next/image|favicon.ico|.*\\..*).*)', '/']
};
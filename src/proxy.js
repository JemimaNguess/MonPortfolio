import { NextResponse } from 'next/server';

const LOCALES = ['fr', 'en'];

// Redirige / vers /fr ou /en selon la langue du navigateur.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const accept = request.headers.get('accept-language') || '';
  const locale = /^en\b/i.test(accept.trim()) ? 'en' : 'fr';
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|admin|_next|holo|clips|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};

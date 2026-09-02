import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Skip middleware for static assets and API
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Ask the BACKEND what this domain is
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/public/resolve-domain/${hostname}`);
    if (!res.ok) return NextResponse.next();

    const site = await res.json();

    // 3. Routing based on Backend logic
    // If it's the admin dashboard or localhost:3000, serve the dashboard
    if (site.type === 'admin' || hostname === 'localhost:3000') {
      return NextResponse.next();
    }

    // If it's a school or garrison, rewrite to /[domain]/path
    if (site.type === 'school' || site.type === 'garrison') {
      url.pathname = `/${hostname}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } catch (e) {
    console.error('Domain Resolution Failed:', e);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

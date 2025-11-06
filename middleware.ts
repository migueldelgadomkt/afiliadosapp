import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const adminPaths = ['/admin'];
const affiliatePaths = ['/afiliado'];

function hasPath(req: NextRequest, paths: string[]) {
  return paths.some((path) => req.nextUrl.pathname.startsWith(path));
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (req.nextUrl.pathname === '/login') {
      return NextResponse.next();
    }
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  const role = token.role as string;
  if (hasPath(req, adminPaths) && role !== 'SUPERADMIN') {
    return NextResponse.redirect(new URL('/afiliado/overview', req.url));
  }
  if (hasPath(req, affiliatePaths) && role !== 'AFILIADO' && role !== 'SUPERADMIN') {
    return NextResponse.redirect(new URL('/admin/overview', req.url));
  }

  if (req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/afiliado/:path*', '/dashboard', '/login']
};

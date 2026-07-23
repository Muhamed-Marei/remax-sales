import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session');
  
  // Define public routes that don't require authentication
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/forgot-password') || 
                      request.nextUrl.pathname.startsWith('/reset-password');
                      
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/admin');

  // If user is not logged in and tries to access a protected route
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access auth routes (like login)
  // Redirect to root — page.tsx will handle role-based routing to /admin or /dashboard
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/login', 
    '/forgot-password', 
    '/reset-password'
  ],
};

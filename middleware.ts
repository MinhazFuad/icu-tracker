import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-uni-project');

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

    const isPublicRoute = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register');

    if (!sessionCookie) {
        if (!isPublicRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    try {
        const { payload } = await jwtVerify(sessionCookie, SECRET_KEY);
        const role = payload.role;

        if (role === 'admin') {
            if (pathname.startsWith('/portal') || pathname === '/') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }

        if (role === 'user') {
            if (pathname.startsWith('/admin')) {
                return NextResponse.redirect(new URL('/portal', request.url));
            }
            if (pathname === '/') {
                return NextResponse.redirect(new URL('/portal', request.url));
            }
        }
    } catch (error) {
        if (!isPublicRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], 
};
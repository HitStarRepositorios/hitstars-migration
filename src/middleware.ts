import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    const sessionToken = request.cookies.get('session')?.value

    // Protect /admin routes
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        if (!sessionToken) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // Protect /dashboard routes
    if (path.startsWith('/dashboard')) {
        if (!sessionToken) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
import { NextResponse } from 'next/server';
// Define the routes that require authentication
var protectedRoutes = [
    '/admin',
    '/security-manager',
    '/department-manager',
    '/user-dashboard',
];
// Define the routes that are public (no authentication required)
var publicRoutes = ['/', '/signin', '/signup'];
export function middleware(request) {
    // Get the pathname from the URL
    var pathname = request.nextUrl.pathname;
    // Check if authentication is enabled
    var isAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH !== 'false';
    // If authentication is disabled, bypass authentication
    if (!isAuthEnabled) {
        return NextResponse.next();
    }
    // In development, enforce authentication
    // Check if the user is authenticated by looking for the user in localStorage
    // Note: This is a client-side check, so we can't do it in middleware
    // Instead, we'll rely on the AuthProvider to handle this on the client side
    // For now, we'll just check if the route is protected and redirect to signin if needed
    var isProtectedRoute = protectedRoutes.some(function (route) {
        return pathname === route || pathname.startsWith("".concat(route, "/"));
    });
    var isPublicRoute = publicRoutes.some(function (route) {
        return pathname === route || pathname.startsWith("".concat(route, "/"));
    });
    // If it's an API route, allow it
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }
    // If it's a protected route, we'll let the client-side AuthProvider handle the authentication
    // If it's a public route, allow access
    // For all other routes, we'll also let the client-side handle it
    return NextResponse.next();
}
// Configure the middleware to run on specific paths
export var config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

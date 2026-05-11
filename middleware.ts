import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const PUBLIC_ROUTES = ["/", "/auth", "/login", "/register"];
const PROTECTED_PREFIXES = ["/dashboard", "/problems", "/roadmaps", "/profile", "/settings"];

export function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;

    const jwtCookie = request.cookies.get("access_token")?.value
        ?? request.cookies.get("token")?.value
        ?? request.cookies.get("auth_token")?.value;

    const isPublic = PUBLIC_ROUTES.some((route) =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (!jwtCookie && isProtected) {
        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (jwtCookie && (pathname === "/auth" || pathname.startsWith("/auth/"))) {
        const redirect = request.nextUrl.searchParams.get("redirect") ?? "/dashboard";
        const dashboardUrl = new URL(redirect, request.url);
        if (redirect === "/dashboard" || redirect.startsWith("/dashboard")) {
            return NextResponse.redirect(dashboardUrl);
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)).*)",
    ],
};

import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

const PROTECTED_PREFIXES = ["/home", "/problems", "/roadmaps", "/profile", "/settings"];

export function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl;

    const hasSessionCookie = Boolean(
        request.cookies.get("access-token")?.value
        || request.cookies.get("refresh-token")?.value
    );

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    // TRƯỜNG HỢP 1: Chưa đăng nhập + Vào trang yêu cầu bảo vệ
    if (!hasSessionCookie && isProtected) {
        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)).*)",
    ],
};

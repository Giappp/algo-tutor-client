import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

const PROTECTED_PREFIXES = ["/home", "/problems", "/roadmaps", "/profile", "/settings"];

export function proxy(request: NextRequest) {
    const {pathname, searchParams} = request.nextUrl;

    const jwtCookie = request.cookies.get("access-token")?.value;

    console.log(jwtCookie);

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    // TRƯỜNG HỢP 1: Chưa đăng nhập + Vào trang yêu cầu bảo vệ
    if (!jwtCookie && isProtected) {
        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // TRƯỜNG HỢP 2: Đã đăng nhập + Đang ở trang Auth (Đăng nhập/Đăng ký)
    if (jwtCookie && pathname.startsWith("/auth")) {
        const redirectUrl = searchParams.get("redirect");

        // Bảo mật Open Redirect: Đảm bảo URL redirect phải là một path nội bộ (bắt đầu bằng "/" nhưng không phải "//")
        const isSafeRedirect = redirectUrl && redirectUrl.startsWith("/") && !redirectUrl.startsWith("//");

        // Nếu an toàn thì trả về đúng trang cũ, nếu không thì về home
        const finalRedirect = isSafeRedirect ? redirectUrl : "/home";

        return NextResponse.redirect(new URL(finalRedirect, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)).*)",
    ],
};

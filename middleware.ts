import { NextRequest, NextResponse } from "next/server";

const DEV_PASSWORD = "240695";
const COOKIE_NAME = "dev_access";

export function middleware(request: NextRequest) {
  // Ignora arquivos estáticos e a própria rota de login
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/dev-login"
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value === DEV_PASSWORD) {
    return NextResponse.next();
  }

  // Redireciona para login passando a URL original
  const loginUrl = new URL("/dev-login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

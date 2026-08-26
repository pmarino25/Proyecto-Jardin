import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Nota: esto es solo una redirección de conveniencia para la experiencia de
// usuario. La protección real de cada ruta/admin API está en el propio
// handler (ver lib/adminGuard.ts y las verificaciones dentro de cada página
// de /admin), como recomienda la documentación de Next.js.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = request.cookies.has("admin_session");
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

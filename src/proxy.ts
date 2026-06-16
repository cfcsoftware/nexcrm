import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

// Define protected and public routes
const protectedRoutes = ["/dashboard", "/tasks", "/leads", "/proposals", "/clients"];
const authRoutes = ["/login"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // 1. Redirect root "/" to "/dashboard"
  if (path === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // 2. Get the session cookie
  const sessionToken = req.cookies.get("session")?.value;

  // 3. Verify session
  let session = null;
  if (sessionToken) {
    session = await decrypt(sessionToken);
  }

  // 4. Redirect rules
  // If trying to access protected route and not logged in, redirect to login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    // Keep track of redirect path
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login page and already logged in, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

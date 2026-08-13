import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  const isAdmin = token?.role === "ADMIN" || token?.role === "admin";
  const isInstructor = token?.role === "INSTRUCTOR" || token?.role === "instructor";

  const isAdminRoute = path.startsWith("/admin");
  const isInstructorRoute = path.startsWith("/instructor");
  const isHomeRoute = path.startsWith("/home");
  const isProfileRoute = path.startsWith("/profile");
  const isRedirectRoute = path.startsWith("/redirect");

  const isProtectedRoute =
    isAdminRoute || isInstructorRoute || isHomeRoute || isProfileRoute || isRedirectRoute;

  // Unauthenticated users trying to access protected routes
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Non-admins trying to access admin routes
  if (!isAdmin && isAdminRoute) {
    if (isInstructor) {
      return NextResponse.redirect(new URL("/instructor/courses", req.url));
    }
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Non-instructors / Non-admins trying to access instructor routes
  if (!isInstructor && !isAdmin && isInstructorRoute) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/home/:path*",
    "/profile/:path*",
    "/redirect",
  ],
};

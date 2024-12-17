import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // If no token is present, allow the request to continue (public access)
  if (!token) {
    return NextResponse.next();
  }

  // Log requests only if on dashboard
  if (url.pathname.startsWith("/dashboard")) {
    console.log(
      "Request for dashboard with token",
      token ? "present" : "missing"
    );
  }

  // Prevent infinite redirects
  if (
    !url.pathname.startsWith("/dashboard") &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify"))
  ) {
    console.log("Redirecting to /dashboard from", url.pathname);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/verify/:path*", "/dashboard/:path*"],
};

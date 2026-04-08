import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Initial response
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Suppress crashes if env vars are missing during setup
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  // 3. Robust SSR Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Sync cookies with the request so the rest of the middleware has them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          
          // Re-instantiate response to include updated cookies
          supabaseResponse = NextResponse.next({
            request,
          });
          
          // Set cookies on the actual outgoing response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 4. Safely refresh the session (important for persistence)
  // This is the core fix for the "Redirected back to login" issue
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 5. Define Protected Routes
  const isProtectedRoute = pathname.startsWith("/profile") || 
                           pathname.startsWith("/favorites") || 
                           pathname.startsWith("/api/protected");

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  // 6. Redirection Logic
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve the original destination for post-login redirect
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets (*.svg, *.png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

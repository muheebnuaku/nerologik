import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session for /admin and /research and sends
 * signed-out visitors to the right login page (/admin/login or /rit).
 * Admin / RIT membership is checked in the layouts and enforced by RLS.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const research = request.nextUrl.pathname.startsWith("/research");
  const loginPath = research ? "/rit" : "/admin/login";
  const isLogin = request.nextUrl.pathname === "/admin/login";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    // Supabase isn't configured on this deployment: show the login page's setup message.
    if (isLogin) return response;
    const login = request.nextUrl.clone();
    login.pathname = loginPath;
    login.search = "?error=config";
    return NextResponse.redirect(login);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const login = request.nextUrl.clone();
    login.pathname = loginPath;
    login.search = "";
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/research/:path*", "/research"],
};

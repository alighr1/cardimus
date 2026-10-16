import { NextResponse, type NextRequest } from "next/server";

// Pages require a session cookie; the cookie is fully validated against the DB in the layout and API routes.
export function proxy(req: NextRequest) {
  if (!req.cookies.get("session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|login|register|icon.svg|manifest.webmanifest|sw.js|favicon.ico).*)"],
};

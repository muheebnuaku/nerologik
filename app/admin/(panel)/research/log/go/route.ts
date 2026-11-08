import { NextResponse, type NextRequest } from "next/server";

/** Turns the "add teammate log" form (GET ?o=&d=) into the log editor URL. */
export function GET(request: NextRequest) {
  const o = (request.nextUrl.searchParams.get("o") ?? "").trim().slice(0, 60);
  const d = request.nextUrl.searchParams.get("d") ?? "";
  const url = request.nextUrl.clone();
  url.search = "";
  if (!o || !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    url.pathname = "/admin/research/log";
    return NextResponse.redirect(url);
  }
  url.pathname = `/admin/research/log/${d}`;
  url.searchParams.set("o", o);
  return NextResponse.redirect(url);
}

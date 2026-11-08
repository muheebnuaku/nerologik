import { NextResponse, type NextRequest } from "next/server";

/** Turns the "log a date" / "add teammate log" forms (GET ?d=&o=) into the log editor URL. */
export function GET(request: NextRequest) {
  const o = (request.nextUrl.searchParams.get("o") ?? "").trim().slice(0, 60);
  const d = request.nextUrl.searchParams.get("d") ?? "";
  const url = request.nextUrl.clone();
  url.search = "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    url.pathname = "/research/log";
    return NextResponse.redirect(url);
  }
  url.pathname = `/research/log/${d}`;
  if (o && o.toLowerCase() !== "me") url.searchParams.set("o", o);
  return NextResponse.redirect(url);
}

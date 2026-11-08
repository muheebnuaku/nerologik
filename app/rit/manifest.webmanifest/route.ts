/** Lets RIT members install the journal on their phone's home screen. */
export function GET() {
  return Response.json(
    {
      name: "Nerologik RIT",
      short_name: "RIT",
      description: "Private daily observation journal.",
      start_url: "/research",
      scope: "/",
      display: "standalone",
      background_color: "#09090b",
      theme_color: "#09090b",
      icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    },
    { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } },
  );
}

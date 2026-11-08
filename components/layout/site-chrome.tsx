"use client";

import { usePathname } from "next/navigation";

/** App areas with their own shell: no public navbar/footer. */
const appAreas = ["/admin", "/research", "/rit"];
const isAdmin = (pathname: string | null) => appAreas.some((a) => pathname === a || !!pathname?.startsWith(`${a}/`));

/** Renders public-site chrome (navbar, footer) everywhere except the admin. */
export function PublicOnly({ children }: { children: React.ReactNode }) {
  return isAdmin(usePathname()) ? null : children;
}

/** <main> with the floating-nav offset on public pages only. */
export function MainShell({ children }: { children: React.ReactNode }) {
  const admin = isAdmin(usePathname());
  return (
    <main id="main" className={admin ? "flex-1" : "flex-1 pt-(--spacing-nav)"}>
      {children}
    </main>
  );
}

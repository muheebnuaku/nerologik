"use client";

import { usePathname } from "next/navigation";

const isAdmin = (pathname: string | null) => pathname === "/admin" || !!pathname?.startsWith("/admin/");

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

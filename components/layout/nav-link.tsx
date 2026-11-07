"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function useIsActive(href: string) {
  const pathname = usePathname();
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  href,
  children,
  className,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const active = useIsActive(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "transition-colors duration-(--duration-base) hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

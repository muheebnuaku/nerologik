import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/admin/forms";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-8">
        <Link href="/" className="w-fit rounded-md" aria-label="Back to site">
          <Logo />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-xl font-semibold">Admin sign in</h1>
          <p className="text-sm text-muted-foreground">Client enquiries and business analyses.</p>
        </div>
        <LoginForm initialError={error === "not-admin" ? "This account doesn't have admin access." : undefined} />
      </div>
    </div>
  );
}

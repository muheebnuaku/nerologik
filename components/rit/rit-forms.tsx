"use client";

import { useActionState, useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";

import { logIn, signUp, type RitState } from "@/app/rit/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function Message({ state }: { state: RitState }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={cn("text-sm", state.ok ? "text-brand" : "text-destructive")}>
      {state.message}
    </p>
  );
}

function Field({ id, label, ...props }: React.ComponentProps<typeof Input> & { id: string; label: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} className="h-11 px-3.5" {...props} />
    </div>
  );
}

export function RitForms({ needsCode, initialError }: { needsCode: boolean; initialError?: string }) {
  const [mode, setMode] = useState<"signup" | "login">(initialError ? "login" : "signup");
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, null);
  const [logInState, logInAction, loggingIn] = useActionState(logIn, initialError ? { ok: false, message: initialError } : null);

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Account" className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("rounded-md py-2 text-sm font-medium transition-colors", mode === m ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {m === "signup" ? "Create account" : "Log in"}
          </button>
        ))}
      </div>

      {mode === "signup" ? (
        <form action={signUpAction} className="flex flex-col gap-4">
          <Field id="name" label="Your name" autoComplete="name" required minLength={2} maxLength={80} />
          <Field id="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="024 123 4567" required />
          <Field id="password" label="Password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" />
          {needsCode && <Field id="code" label="Team code" autoComplete="off" required placeholder="From your team lead" />}
          <Message state={signUpState} />
          <Button type="submit" size="lg" disabled={signingUp}>
            {signingUp ? <Loader2 className="animate-spin" /> : <UserPlus />} Create my research account
          </Button>
          <p className="text-xs text-muted-foreground">You&apos;ll get your own private research journal. Nobody else can read your notes.</p>
        </form>
      ) : (
        <form action={logInAction} className="flex flex-col gap-4">
          <Field id="login-phone" name="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="024 123 4567" required />
          <Field id="login-password" name="password" label="Password" type="password" autoComplete="current-password" required />
          <Message state={logInState} />
          <Button type="submit" size="lg" disabled={loggingIn}>
            {loggingIn ? <Loader2 className="animate-spin" /> : <LogIn />} Log in
          </Button>
        </form>
      )}
    </div>
  );
}

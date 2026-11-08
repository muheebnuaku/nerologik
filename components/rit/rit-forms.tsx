"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn, Phone, User, UserPlus, KeyRound, type LucideIcon } from "lucide-react";

import { logIn, signUp, type RitState } from "@/app/rit/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Message({ state }: { state: RitState }) {
  if (!state) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm",
        state.ok ? "border-primary/40 bg-brand-soft text-foreground" : "border-destructive/40 bg-destructive/10 text-foreground",
      )}
    >
      {state.message}
    </p>
  );
}

type FieldProps = React.ComponentProps<"input"> & { id: string; label: string; icon: LucideIcon; hint?: string };

function Field({ id, label, icon: Icon, hint, type, className, ...props }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={isPassword && show ? "text" : type}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={cn(
            "h-12 w-full rounded-xl border border-input bg-background pl-10 text-base outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15",
            isPassword ? "pr-12" : "pr-3.5",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function RitForms({ needsCode, initialError }: { needsCode: boolean; initialError?: string }) {
  const [mode, setMode] = useState<"signup" | "login">(initialError ? "login" : "signup");
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, null);
  const [logInState, logInAction, loggingIn] = useActionState(logIn, initialError ? { ok: false, message: initialError } : null);

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Account" className="relative grid grid-cols-2 rounded-xl bg-secondary p-1">
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-card shadow-sm transition-transform duration-300 ease-out",
            mode === "login" && "translate-x-full",
          )}
        />
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("relative z-10 min-h-11 rounded-lg text-sm font-medium transition-colors", mode === m ? "text-foreground" : "text-muted-foreground")}
          >
            {m === "signup" ? "Create account" : "Log in"}
          </button>
        ))}
      </div>

      {mode === "signup" ? (
        <form action={signUpAction} className="flex flex-col gap-4" key="signup">
          <Field id="name" label="Your name" icon={User} autoComplete="name" autoCapitalize="words" required minLength={2} maxLength={80} placeholder="e.g. Kwabena Mensah" />
          <Field
            id="phone"
            label="Phone number"
            icon={Phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="024 123 4567"
            hint="You'll log in with this number. 024… or +233… both work."
            required
          />
          <Field id="password" label="Password" icon={KeyRound} type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" />
          {needsCode && <Field id="code" label="Team code" icon={KeyRound} autoComplete="off" autoCapitalize="none" required placeholder="From your team lead" />}
          <Message state={signUpState} />
          <Button type="submit" size="lg" disabled={signingUp} className="h-12 rounded-xl text-base">
            {signingUp ? <Loader2 className="animate-spin" /> : <UserPlus />} Create my account
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have one?{" "}
            <button type="button" onClick={() => setMode("login")} className="font-medium text-brand underline-offset-4 hover:underline">
              Log in
            </button>
          </p>
        </form>
      ) : (
        <form action={logInAction} className="flex flex-col gap-4" key="login">
          <Field id="login-phone" name="phone" label="Phone number" icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="024 123 4567" required />
          <Field id="login-password" name="password" label="Password" icon={KeyRound} type="password" autoComplete="current-password" required />
          <Message state={logInState} />
          <Button type="submit" size="lg" disabled={loggingIn} className="h-12 rounded-xl text-base">
            {loggingIn ? <Loader2 className="animate-spin" /> : <LogIn />} Log in
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            New to RIT?{" "}
            <button type="button" onClick={() => setMode("signup")} className="font-medium text-brand underline-offset-4 hover:underline">
              Create an account
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

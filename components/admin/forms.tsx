"use client";

import { useActionState } from "react";
import { Loader2, LogIn, Save, Send } from "lucide-react";

import { resendEstimate, signIn, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Label, NativeSelect, Textarea } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import { leadStatuses } from "@/lib/admin/status";
import { cn } from "@/lib/utils";

function Feedback({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={cn("text-sm", state.ok ? "text-brand" : "text-destructive")}>
      {state.message}
    </p>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState(signIn, initialError ? { ok: false, message: initialError } : null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-11 px-3.5" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11 px-3.5" />
      </div>
      <Feedback state={state} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />} Sign in
      </Button>
    </form>
  );
}

type StatusFormProps = {
  id: string;
  status: string;
  notes: string | null;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

export function StatusForm({ id, status, notes, action }: StatusFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Status</Label>
        <NativeSelect id="status" name="status" defaultValue={status}>
          {leadStatuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Internal notes</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={notes ?? ""} placeholder="Call outcome, next step, quote sent…" />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Save
        </Button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function ResendButton({ id, label = "Resend estimate email" }: { id: string; label?: string }) {
  const [state, formAction, pending] = useActionState(resendEstimate, null);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Send />} {label}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

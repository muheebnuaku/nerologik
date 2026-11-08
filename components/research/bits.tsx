"use client";

import { useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";

import type { Result } from "@/app/admin/(panel)/research/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findSensitive } from "@/lib/research/privacy";
import { cn } from "@/lib/utils";

export function Feedback({ result }: { result: Result | null }) {
  if (!result?.message) return null;
  return (
    <p role={result.ok ? "status" : "alert"} className={cn("text-sm", result.ok ? "text-brand" : "text-destructive")}>
      {result.message}
    </p>
  );
}

/** Live warning under any text that looks like a taxpayer identifier. */
export function PrivacyHint({ text }: { text: string }) {
  const hits = findSensitive(text);
  if (!hits.length) return null;
  return (
    <p role="alert" className="flex items-start gap-1.5 text-xs text-destructive">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      Looks like {hits.map((h) => h.label).join(", ")}. Record the process, not the taxpayer: use counts only.
    </p>
  );
}

/** Editable list of short text items with Enter-to-add. */
export function ListInput({
  id,
  value,
  onChange,
  placeholder,
  suggestions = [],
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (text = draft) => {
    const t = text.trim();
    if (t.length < 2 || value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  };
  const unused = suggestions.filter((s) => !value.includes(s)).slice(0, 6);

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {value.map((v, i) => (
            <li key={`${v}-${i}`} className="flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              <span className="flex-1">{v}</span>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`Remove ${v}`} className="text-muted-foreground hover:text-destructive">
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-10 px-3"
        />
        <Button type="button" variant="outline" size="icon" onClick={() => add()} aria-label="Add">
          <Plus />
        </Button>
      </div>
      <PrivacyHint text={draft} />
      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unused.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-md border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-brand/40 hover:text-foreground">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScorePicker({ value, onChange, label }: { value: number | null; onChange: (v: number | null) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(value === n ? null : n)}
          className={cn(
            "size-8 rounded-md border text-sm font-medium tabular-nums transition-colors",
            value === n ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-brand/40",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

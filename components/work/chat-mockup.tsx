import { Bot } from "lucide-react";

const MESSAGES = [
  { from: "user", text: "Hi, do you deliver to Kumasi?" },
  { from: "bot", text: "Yes! Kumasi delivery takes 1–2 days. Shall I place an order for you?" },
  { from: "user", text: "Yes please, 2 bags" },
  { from: "bot", text: "Done ✅ Order #2381 confirmed. A payment link is on its way." },
] as const;

/** Illustrative chat preview used for the WhatsApp AI bot card. */
export function ChatMockup() {
  return (
    <div aria-hidden="true" className="flex size-full flex-col bg-muted">
      <div className="flex items-center gap-2.5 border-b border-border bg-card px-4 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="size-4" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-xs font-semibold">AI Assistant</span>
          <span className="text-[0.625rem] text-brand">online</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 p-4">
        {MESSAGES.map((m, i) => (
          <p
            key={i}
            className={
              m.from === "user"
                ? "max-w-[78%] self-end rounded-xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground"
                : "max-w-[78%] self-start rounded-xl rounded-bl-sm border border-border bg-card px-3 py-2 text-xs"
            }
          >
            {m.text}
          </p>
        ))}
      </div>
    </div>
  );
}

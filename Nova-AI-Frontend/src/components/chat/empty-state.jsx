import { Button } from "@/components/ui/button";
import agentLogo from "@/assets/agent-logo.png";
import { ArrowUpRight } from "lucide-react";

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a short poem about the ocean",
  "Give me ideas for a weekend project",
  "Help me draft a polite follow-up email",
];

export function EmptyState({ onSuggestionClick }) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto p-4 sm:p-8">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center sm:gap-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center gap-3">
          <img
            alt="Nova assistant logo"
            className="size-14 rounded-2xl border border-border p-1 sm:size-16"
            height={64}
            src={agentLogo}
            width={64}
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              How can I help you today?
            </h1>
            <p className="text-sm text-muted-foreground">
              Nova is your AI assistant — ask anything to get started.
            </p>
          </div>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((text) => (
            <Button
              className="group h-auto w-full justify-between gap-2 whitespace-normal rounded-xl px-3.5 py-3 text-left text-sm font-normal transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 active:translate-y-0"
              key={text}
              onClick={() => onSuggestionClick(text)}
              variant="outline"
            >
              <span className="min-w-0">{text}</span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

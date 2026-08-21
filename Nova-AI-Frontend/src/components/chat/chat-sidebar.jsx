import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, X, Trash2 } from "lucide-react";
import agentLogo from "@/assets/agent-logo.png";

export function ChatSidebar({
  conversations,
  activeId,
  isOpen,
  onToggle,
  onNewChat,
  onSelect,
  onDelete,
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onToggle}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          // Mobile state: slide in/out using translate-x
          isOpen
            ? "w-72 translate-x-0 border-r border-border"
            : "w-72 -translate-x-full border-transparent",
          // Desktop state override: transition width and opacity
          "lg:static lg:z-auto",
          isOpen
            ? "lg:w-72 lg:translate-x-0 lg:opacity-100 lg:border-border"
            : "lg:w-0 lg:translate-x-0 lg:opacity-0 lg:border-transparent lg:overflow-hidden"
        )}
      >
        <div className="flex h-full w-72 flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-border px-3">
            <img
              alt=""
              className="size-6 rounded-md"
              height={24}
              src={agentLogo}
              width={24}
            />
            <span className="flex-1 text-sm font-semibold">Nova</span>
            <Button
              aria-label="Close sidebar"
              className="transition-all duration-200 hover:scale-105 active:scale-95 hover:rotate-90 lg:hidden"
              onClick={onToggle}
              size="icon"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="p-3">
            <Button
              className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-sm"
              onClick={onNewChat}
              variant="outline"
            >
              <Plus className="size-4" />
              New chat
            </Button>
          </div>

          <p className="px-4 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Chats
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            <div className="space-y-0.5">
              {conversations.map((conversation) => (
                <div
                  className={cn(
                    "group flex items-center gap-1 rounded-lg pr-1 transition-all duration-200 hover:translate-x-0.5",
                    conversation.id === activeId
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/60",
                  )}
                  key={conversation.id}
                >
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm"
                    onClick={() => onSelect(conversation.id)}
                    type="button"
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{conversation.title}</span>
                  </button>
                  <Button
                    aria-label="Delete conversation"
                    className="size-7 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => onDelete(conversation.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

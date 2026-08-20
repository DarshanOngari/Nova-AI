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
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden",
        )}
      >
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
            onClick={onToggle}
            size="icon"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-3">
          <Button
            className="w-full justify-start gap-2"
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
                  "group flex items-center gap-1 rounded-lg pr-1 transition-colors",
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
                  className="size-7 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                  onClick={() => onDelete(conversation.id)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

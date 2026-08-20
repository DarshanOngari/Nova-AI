import { useState } from "react";
import { ChatHeader } from "./chat-header";
import { ChatSidebar } from "./chat-sidebar";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { MessageList } from "./message-list";
import { useChat } from "@/hooks/use-chat";
import { useTheme } from "@/hooks/use-theme";

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const {
    activeConversation,
    conversations,
    deleteConversation,
    newConversation,
    selectConversation,
    sendMessage,
    status,
  } = useChat();

  const hasMessages = activeConversation.messages.length > 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <ChatSidebar
        activeId={activeConversation.id}
        conversations={conversations}
        isOpen={sidebarOpen}
        onDelete={deleteConversation}
        onNewChat={() => {
          newConversation();
          setSidebarOpen(false);
        }}
        onSelect={(id) => {
          selectConversation(id);
          setSidebarOpen(false);
        }}
        onToggle={() => setSidebarOpen((open) => !open)}
      />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          onNewChat={() => newConversation()}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onToggleTheme={toggleTheme}
          sidebarOpen={sidebarOpen}
          theme={theme}
          title={hasMessages ? activeConversation.title : undefined}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {hasMessages ? (
            <MessageList
              messages={activeConversation.messages}
              status={status}
            />
          ) : (
            <EmptyState onSuggestionClick={sendMessage} />
          )}
        </div>

        <div className="bg-background/80 backdrop-blur-md">
          <div className="mx-auto w-full max-w-3xl px-3 pb-3 pt-3 sm:px-4 sm:pb-5">
            <Composer onSend={sendMessage} status={status} />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Nova can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

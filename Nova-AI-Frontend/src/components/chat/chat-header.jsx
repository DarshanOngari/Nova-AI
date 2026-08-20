import { Button } from "@/components/ui/button";
import { Menu, Moon, PanelLeft, Plus, Sun, LogOut } from "lucide-react";
import agentLogo from "@/assets/agent-logo.png";
import { useAuth } from "@/lib/auth-context";

export function ChatHeader({
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  theme,
  onToggleTheme,
  title,
}) {
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-2 backdrop-blur-md sm:px-4">
      <Button
        aria-expanded={sidebarOpen}
        aria-label="Toggle sidebar"
        className="shrink-0"
        onClick={onToggleSidebar}
        size="icon"
        variant="ghost"
      >
        <Menu className="size-5 lg:hidden" />
        <PanelLeft className="hidden size-5 lg:block" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <img
          alt=""
          className="size-6 shrink-0 rounded-md"
          height={24}
          src={agentLogo}
          width={24}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {title?.trim() ? title : "Nova"}
          </p>
          <p className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
            Gemini 3.5 Flash
          </p>
        </div>
      </div>

      <Button
        aria-label="New chat"
        className="shrink-0 gap-1.5"
        onClick={onNewChat}
        size="sm"
        variant="outline"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">New chat</span>
      </Button>

      <Button
        aria-label="Toggle theme"
        className="shrink-0"
        onClick={onToggleTheme}
        size="icon"
        variant="ghost"
      >
        {theme === "light" ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
      </Button>

      <Button
        aria-label="Log out"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={signOut}
        size="icon"
        variant="ghost"
      >
        <LogOut className="size-4" />
      </Button>
    </header>
  );
}

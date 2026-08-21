import { Button } from "@/components/ui/button";
import { Menu, Moon, PanelLeft, Plus, Sun, LogOut } from "lucide-react";
import agentLogo from "@/assets/agent-logo.png";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function ChatHeader({
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  theme,
  onToggleTheme,
  title,
}) {
  const { user, signOut } = useAuth();
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-2 backdrop-blur-md sm:px-4">
      <Button
        aria-expanded={sidebarOpen}
        aria-label="Toggle sidebar"
        className="shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={onToggleSidebar}
        size="icon"
        variant="ghost"
      >
        <Menu className="size-5 lg:hidden transition-transform duration-200 hover:rotate-6" />
        <PanelLeft className="hidden size-5 lg:block transition-transform duration-200 hover:scale-110" />
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
        className="shrink-0 gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-sm"
        onClick={onNewChat}
        size="sm"
        variant="outline"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">New chat</span>
      </Button>

      <Button
        aria-label="Toggle theme"
        className="shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={onToggleTheme}
        size="icon"
        variant="ghost"
      >
        <span className="transition-transform duration-300 hover:rotate-12 block">
          {theme === "light" ? (
            <Moon className="size-4 animate-in fade-in zoom-in duration-200" />
          ) : (
            <Sun className="size-4 animate-in fade-in zoom-in duration-200" />
          )}
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="User profile menu"
            className="size-8 rounded-full p-0 shrink-0 select-none overflow-hidden border border-border hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
            variant="ghost"
          >
            <div className="flex size-full items-center justify-center bg-primary text-primary-foreground text-xs font-semibold">
              {userInitial}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-1 p-1">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
              <p className="text-sm font-semibold truncate text-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={signOut}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
          >
            <LogOut className="size-4 mr-2" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

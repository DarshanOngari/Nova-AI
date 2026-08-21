import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Activity,
  Menu,
  X,
  Moon,
  Sun,
  ArrowLeft,
  LogOut,
  Shield,
} from "lucide-react";
import agentLogo from "@/assets/agent-logo.png";

import Dashboard from "./dashboard";
import UsersPage from "./users-page";
import ConversationsPage from "./conversations-page";
import AIUsagePage from "./ai-usage-page";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "ai-usage", label: "AI Usage", icon: Activity },
];

export default function AdminLayout({ onNavigateToChat }) {
  const { signOut, userProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UsersPage />;
      case "conversations":
        return <ConversationsPage />;
      case "ai-usage":
        return <AIUsagePage />;
      default:
        return <Dashboard />;
    }
  };

  const handleNavClick = (id) => {
    setActiveSection(id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileSidebarOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={agentLogo} alt="" className="size-7 rounded-md shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Nova Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {userProfile?.username || userProfile?.email || "Admin"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 transition-all duration-200 hover:scale-105"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3 space-y-1">
          <button
            onClick={onNavigateToChat}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 hover:translate-x-0.5"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Back to Chat
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="size-4 shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 transition-all duration-200 hover:scale-105"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-2 flex-1">
            <Shield className="size-4 text-primary hidden sm:block" />
            <h1 className="text-sm font-semibold capitalize">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label || "Dashboard"}
            </h1>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={toggleTheme}
          >
            <span className="transition-transform duration-300 hover:rotate-12 block">
              {theme === "light" ? (
                <Moon className="size-4 animate-in fade-in zoom-in duration-200" />
              ) : (
                <Sun className="size-4 animate-in fade-in zoom-in duration-200" />
              )}
            </span>
          </Button>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

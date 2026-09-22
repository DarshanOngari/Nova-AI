import { useState, useEffect, Component } from "react";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { ChatLayout } from "./components/chat/chat-layout";
import { LoginPage } from "./pages/login";
import AdminLayout from "./pages/admin/admin-layout";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading Nova AI...</p>
        </div>
      </div>
    );
  }

  if (!user || currentPath === "/login") {
    if (!user && currentPath !== "/login") {
      navigate("/login");
    }
    return <LoginPage onLoginSuccess={() => navigate("/")} />;
  }

  // Admin routing — only accessible to users with role === "admin"
  if (currentPath.startsWith("/admin")) {
    if (userProfile?.role === "admin") {
      return <AdminLayout onNavigateToChat={() => navigate("/")} />;
    }
    // Non-admin trying to access /admin — redirect to chat
    navigate("/");
    return null;
  }

  return <ChatLayout />;
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
          <AppContent />
          <Toaster position="top-center" />
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;


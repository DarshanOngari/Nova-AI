import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { ChatLayout } from "./components/chat/chat-layout";
import { LoginPage } from "./pages/login";
import { Toaster } from "sonner";

function AppContent() {
  const { user, loading } = useAuth();
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

  return <ChatLayout />;
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

export default App;

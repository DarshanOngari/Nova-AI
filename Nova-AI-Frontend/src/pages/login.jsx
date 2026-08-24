import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff, ArrowLeft, Mail, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

function validatePassword(pass) {
  if (pass.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(pass)) {
    return "Password must contain at least 1 uppercase letter (A-Z).";
  }
  if (!/[a-z]/.test(pass)) {
    return "Password must contain at least 1 lowercase letter (a-z).";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
    return "Password must contain at least 1 special character (e.g. !@#$%^&*).";
  }
  return null;
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function LoginPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login");
  const [view, setView] = useState("auth");

  // Separate states for Login vs Sign Up
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");

  // Username availability check states
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameMessage, setUsernameMessage] = useState("");
  const usernameDebounceRef = useRef(null);

  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpToken, setOtpToken] = useState("");

  // Signup OTP verification states
  const [pendingSignupEmail, setPendingSignupEmail] = useState("");
  const [signupOtpToken, setSignupOtpToken] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);

  // UI toggle states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  // Reset inputs on component mount & check for OAuth redirect errors
  useEffect(() => {
    resetFormState();

    // Check for hash errors from OAuth redirect
    const hash = window.location.hash;
    if (hash && hash.includes("error_description")) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDescription = params.get("error_description");
      if (errorDescription) {
        toast.error(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
      }
    }
    // Check search query params for errors
    const searchParams = new URLSearchParams(window.location.search);
    const queryError = searchParams.get("error_description");
    if (queryError) {
      toast.error(queryError);
    }
  }, []);

  // Notify parent if user logged in
  useEffect(() => {
    if (user && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [user, onLoginSuccess]);

  // Cleanup cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const resetFormState = () => {
    setLoginEmail("");
    setLoginPassword("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupUsername("");
    setUsernameStatus(null);
    setUsernameMessage("");
    setResetEmail("");
    setNewPassword("");
    setOtpToken("");
    setSignupOtpToken("");
    setPendingSignupEmail("");
    setShowLoginPassword(false);
    setShowSignupPassword(false);
    setShowNewPassword(false);
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }
    setResendCooldown(0);
  };

  // Live username availability checker with 500ms debounce
  const checkUsernameAvailability = useCallback((value) => {
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);

    if (!value || value.length === 0) {
      setUsernameStatus(null);
      setUsernameMessage("");
      return;
    }

    // Instant format validation before hitting the API
    if (value.length < 3) {
      setUsernameStatus("invalid");
      setUsernameMessage("Must be at least 3 characters.");
      return;
    }
    if (value.length > 20) {
      setUsernameStatus("invalid");
      setUsernameMessage("Must be at most 20 characters.");
      return;
    }
    if (!USERNAME_REGEX.test(value)) {
      setUsernameStatus("invalid");
      setUsernameMessage("Only letters, numbers, and underscores allowed.");
      return;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Checking availability...");

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/users/check-username?username=${encodeURIComponent(value)}`
        );
        const json = await res.json();
        if (json.available) {
          setUsernameStatus("available");
          setUsernameMessage(json.message || "Username is available!");
        } else {
          setUsernameStatus("taken");
          setUsernameMessage(json.message || "Username is already taken.");
        }
      } catch {
        setUsernameStatus(null);
        setUsernameMessage("");
      }
    }, 500);
  }, []);

  const startResendCooldown = () => {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    resetFormState();
  };

  const handleSwitchView = (newView) => {
    setView(newView);
    resetFormState();
  };

  // Google OAuth Sign In / Sign Up
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const redirectUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      }
    } catch (err) {
      toast.error("Failed to start Google sign-in.");
      setLoading(false);
    }
  };

  // 1. Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Successfully logged in!");
      resetFormState();
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  // 2. Handle Signup — sends OTP email, transitions to verify-signup view
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupUsername.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Block submission if username is not confirmed available
    if (usernameStatus !== "available") {
      toast.error("Please choose a valid, available username.");
      return;
    }

    const passError = validatePassword(signupPassword);
    if (passError) {
      toast.error(passError);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        data: {
          username: signupUsername.trim(), // Passed to the DB trigger → public.users
        },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    // If session is immediately available (auto-confirm enabled in Supabase dashboard),
    // log the user in directly. Otherwise require email OTP verification.
    if (data.session) {
      toast.success("Account created! Welcome to Nova AI.");
      resetFormState();
      if (onLoginSuccess) onLoginSuccess();
      return;
    }

    // Email confirmation required — transition to OTP verification screen
    setPendingSignupEmail(signupEmail.trim());
    startResendCooldown();
    setView("verify-signup");
    toast.success("Verification code sent! Check your email inbox.");
  };

  // 3. Verify Signup OTP
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    if (!signupOtpToken.trim()) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }
    if (signupOtpToken.trim().length !== 6) {
      toast.error("Verification code must be exactly 6 digits");
      return;
    }

    setLoading(true);

    // Try type "signup" first (Supabase recommended for new account confirmations)
    let { error: verifyError } = await supabase.auth.verifyOtp({
      email: pendingSignupEmail,
      token: signupOtpToken.trim(),
      type: "signup",
    });

    // Fallback to type "email" (used when email confirmations are in OTP mode)
    if (verifyError) {
      const res = await supabase.auth.verifyOtp({
        email: pendingSignupEmail,
        token: signupOtpToken.trim(),
        type: "email",
      });
      verifyError = res.error;
    }

    setLoading(false);

    if (verifyError) {
      toast.error(verifyError.message || "Invalid or expired code. Please try again.");
      return;
    }

    // Supabase automatically establishes the session on successful OTP verification.
    // The auth-context listener will pick up the SIGNED_IN event and redirect the user.
    toast.success("Email confirmed! Welcome to Nova AI 🎉");
    resetFormState();
  };

  // 4. Resend Signup Verification OTP
  const handleResendSignupOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingSignupEmail,
    });
    setLoading(false);

    if (error) {
      if (error.status === 429 || error.message.includes("security")) {
        toast.error("Too many requests! Please wait before requesting another code.");
      } else {
        toast.error(error.message);
      }
    } else {
      startResendCooldown();
      toast.success("New verification code sent! Check your email.");
    }
  };

  // 5. Send Password Reset OTP
  const handleSendPasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());
    setLoading(false);

    if (error) {
      if (error.status === 429 || error.message.includes("security")) {
        toast.error(
          "Too many requests! Please wait 60 seconds before requesting another reset code."
        );
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Reset code sent! Check your email.");
      setView("reset-password");
    }
  };

  // 6. Verify Reset OTP Code & Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpToken.trim() || !newPassword) {
      toast.error("Please enter both the OTP code and new password");
      return;
    }

    const passError = validatePassword(newPassword);
    if (passError) {
      toast.error(passError);
      return;
    }

    setLoading(true);

    let { error: verifyError } = await supabase.auth.verifyOtp({
      email: resetEmail,
      token: otpToken.trim(),
      type: "email",
    });

    if (verifyError) {
      const res = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: otpToken.trim(),
        type: "recovery",
      });
      verifyError = res.error;
    }

    if (verifyError) {
      setLoading(false);
      toast.error(verifyError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (updateError) {
      toast.error(updateError.message);
    } else {
      toast.success("Password reset successfully! Please log in.");
      setView("auth");
      setActiveTab("login");
      resetFormState();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background radial overlays */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top_right,var(--color-muted),transparent_50%)]" />
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_bottom_left,var(--color-muted),transparent_50%)]" />

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-110 hover:rotate-12 select-none">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Nova AI</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to start chatting with your AI assistant
          </p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-xl">
          {/* Main Auth View (Login / Signup) */}
          {view === "auth" && (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full animate-in fade-in-0 duration-300">
              <TabsList className="grid w-full grid-cols-2 rounded-t-lg bg-muted/50 p-1">
                <TabsTrigger value="login" className="transition-all duration-200 hover:bg-background/40 hover:text-foreground data-[state=active]:hover:bg-background">Login</TabsTrigger>
                <TabsTrigger value="signup" className="transition-all duration-200 hover:bg-background/40 hover:text-foreground data-[state=active]:hover:bg-background">Sign Up</TabsTrigger>
              </TabsList>

              {/* LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} autoComplete="on">
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Enter your email and password to access your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Google OAuth Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 py-5 border-border/80 hover:bg-accent/60 hover:text-accent-foreground font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm"
                    >
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </Button>

                    {/* Divider */}
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/60" />
                      </div>
                      <div className="relative flex justify-center text-[11px] uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or continue with email
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button
                          type="button"
                          onClick={() => handleSwitchView("forgot-password")}
                          className="text-xs text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          disabled={loading}
                          required
                          className="pr-10 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-all duration-200 hover:scale-110 active:scale-90"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-md" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* SIGNUP TAB */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} autoComplete="off">
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Get started with Nova AI. We&apos;ll send a verification code to your email.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Google OAuth Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 py-5 border-border/80 hover:bg-accent/60 hover:text-accent-foreground font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm"
                    >
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </Button>

                    {/* Divider */}
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/60" />
                      </div>
                      <div className="relative flex justify-center text-[11px] uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or continue with email
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="off"
                        placeholder="name@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                      />
                    </div>

                    {/* Username field with live availability check */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <div className="relative">
                        <Input
                          id="signup-username"
                          type="text"
                          autoComplete="off"
                          placeholder="e.g. nova_user"
                          value={signupUsername}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\s/g, "");
                            setSignupUsername(val);
                            checkUsernameAvailability(val);
                          }}
                          disabled={loading}
                          required
                          maxLength={20}
                          className={`pr-8 ${
                            usernameStatus === "available"
                              ? "border-green-500 focus-visible:ring-green-500"
                              : usernameStatus === "taken" || usernameStatus === "invalid"
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        {/* Status icon inside input */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {usernameStatus === "checking" && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {usernameStatus === "available" && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      {/* Availability message */}
                      {usernameMessage && (
                        <p
                          className={`text-[11px] font-medium ${
                            usernameStatus === "available"
                              ? "text-green-500"
                              : usernameStatus === "checking"
                              ? "text-muted-foreground"
                              : "text-red-500"
                          }`}
                        >
                          {usernameMessage}
                        </p>
                      )}
                      {!usernameMessage && (
                        <p className="text-[11px] text-muted-foreground">
                          3-20 characters: letters, numbers, and underscores only.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          disabled={loading}
                          required
                          className="pr-10 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-all duration-200 hover:scale-110 active:scale-90"
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Min 8 chars, 1 uppercase (A-Z), 1 lowercase (a-z), 1 special char
                        (!@#$).
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        loading ||
                        usernameStatus !== "available"
                      }
                    >
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* VERIFY SIGNUP EMAIL OTP VIEW */}
          {view === "verify-signup" && (
            <form onSubmit={handleVerifySignupOtp} autoComplete="off" className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSignupEmail("");
                      setSignupOtpToken("");
                      if (cooldownRef.current) clearInterval(cooldownRef.current);
                      setResendCooldown(0);
                      setView("auth");
                      setActiveTab("signup");
                    }}
                    className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-x-0.5 active:scale-95"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <CardTitle>Verify your email</CardTitle>
                </div>
                <CardDescription>
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-foreground">{pendingSignupEmail}</span>.
                  Enter it below to confirm your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Email icon visual indicator */}
                <div className="flex justify-center py-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Mail className="h-7 w-7" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-otp">6-Digit Verification Code</Label>
                  <Input
                    id="signup-otp"
                    type="text"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={signupOtpToken}
                    onChange={(e) =>
                      setSignupOtpToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="text-center text-2xl tracking-[0.4em] font-mono"
                    disabled={loading}
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-center text-muted-foreground">
                    Check your spam folder if you don&apos;t see it in your inbox.
                  </p>
                </div>

                {/* Resend Code */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Didn&apos;t receive the code?
                  </span>
                  <button
                    type="button"
                    onClick={handleResendSignupOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline transition-all duration-200 hover:scale-[1.02]"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-md"
                  disabled={loading || signupOtpToken.length !== 6}
                >
                  {loading ? "Verifying..." : "Confirm Email"}
                </Button>
              </CardFooter>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === "forgot-password" && (
            <form onSubmit={handleSendPasswordReset} autoComplete="off" className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchView("auth")}
                    className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-x-0.5 active:scale-95"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <CardTitle>Reset Password</CardTitle>
                </div>
                <CardDescription>
                  Enter your email and we&apos;ll send you a 6-digit OTP code to reset your
                  password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-md" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send Reset Code"}
                </Button>
              </CardFooter>
            </form>
          )}

          {/* RESET PASSWORD OTP & NEW PASSWORD VIEW */}
          {view === "reset-password" && (
            <form onSubmit={handleResetPassword} autoComplete="off" className="animate-in fade-in-0 duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchView("auth")}
                    className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-x-0.5 active:scale-95"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <CardTitle>Set New Password</CardTitle>
                </div>
                <CardDescription>
                  Enter the 6-digit OTP sent to{" "}
                  <span className="font-semibold text-foreground">{resetEmail}</span> and
                  choose a new password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-otp">6-Digit OTP Code</Label>
                  <Input
                    id="reset-otp"
                    type="text"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    className="text-center text-lg tracking-widest font-mono transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="pr-10 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-all duration-200 hover:scale-110 active:scale-90"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Min 8 chars, 1 uppercase (A-Z), 1 lowercase (a-z), 1 special char (!@#$).
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-md" disabled={loading}>
                  {loading ? "Resetting Password..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react";

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

export function LoginPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login");
  const [view, setView] = useState("auth");

  // Separate states for Login vs Sign Up
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpToken, setOtpToken] = useState("");

  // UI toggle states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  // Reset inputs on component mount
  useEffect(() => {
    resetFormState();
  }, []);

  // Notify parent if user logged in
  useEffect(() => {
    if (user && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [user, onLoginSuccess]);

  const resetFormState = () => {
    setLoginEmail("");
    setLoginPassword("");
    setSignupEmail("");
    setSignupPassword("");
    setResetEmail("");
    setNewPassword("");
    setOtpToken("");
    setShowLoginPassword(false);
    setShowSignupPassword(false);
    setShowNewPassword(false);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    resetFormState();
  };

  const handleSwitchView = (newView) => {
    setView(newView);
    resetFormState();
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

  // 2. Handle Direct Signup & Immediate Login
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) {
      toast.error("Please fill in all fields");
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
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Auto sign in if session is not immediately returned
    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: signupEmail.trim(),
        password: signupPassword,
      });
      setLoading(false);
      if (signInErr) {
        toast.error(signInErr.message);
        return;
      }
    } else {
      setLoading(false);
    }

    toast.success("Account created successfully!");
    resetFormState();
    if (onLoginSuccess) onLoginSuccess();
  };

  // 3. Send Password Reset OTP
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
        toast.error("Too many requests! Please wait 60 seconds before requesting another reset code.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Reset code sent! Check your email.");
      setView("reset-password");
    }
  };

  // 4. Verify Reset OTP Code & Set New Password
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
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
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-t-lg bg-muted/50 p-1">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button
                          type="button"
                          onClick={() => handleSwitchView("forgot-password")}
                          className="text-xs text-primary hover:underline font-medium"
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
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
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
                      Get started with Nova AI. Must include uppercase, lowercase & special character.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      />
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
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Min 8 chars, 1 uppercase (A-Z), 1 lowercase (a-z), 1 special char (!@#$).
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === "forgot-password" && (
            <form onSubmit={handleSendPasswordReset} autoComplete="off">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchView("auth")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <CardTitle>Reset Password</CardTitle>
                </div>
                <CardDescription>
                  Enter your email and we'll send you a 6-digit OTP code to reset your password.
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
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send Reset Code"}
                </Button>
              </CardFooter>
            </form>
          )}

          {/* RESET PASSWORD OTP & NEW PASSWORD VIEW */}
          {view === "reset-password" && (
            <form onSubmit={handleResetPassword} autoComplete="off">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchView("auth")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <CardTitle>Set New Password</CardTitle>
                </div>
                <CardDescription>
                  Enter the 6-digit OTP sent to <span className="font-semibold text-foreground">{resetEmail}</span> and choose a new password.
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
                    className="text-center text-lg tracking-widest font-mono"
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
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Min 8 chars, 1 uppercase (A-Z), 1 lowercase (a-z), 1 special char (!@#$).
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
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

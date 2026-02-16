import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/services/api";

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const isPasswordStrong = (pass: string) => {
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return pass.length >= 8 && hasLetter && hasNumber && hasSymbol;
  };

  const showPasswordError = !isLogin && password.length > 0 && !isPasswordStrong(password);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !isPasswordStrong(password)) {
      toast.error("Please use a stronger password");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Welcome back!");
        window.location.reload(); // Refresh to update session state in Index.tsx
      } else {
        await api.post("/auth/register", {
          email,
          password,
          fullName,
        });
        toast.success("Account created successfully! Please sign in.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-primary/20 overflow-hidden">
      <CardHeader className="space-y-1 gradient-hero">
        <CardTitle className="text-2xl font-bold text-center text-white/90 drop-shadow-sm">
          {isLogin ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-center text-white/70">
          {isLogin
            ? "Sign in to access your AI-powered resumes"
            : "Start building professional resumes with AI"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {showPasswordError && (
              <p className="text-xs text-red-500 mt-1 font-medium italic animate-in fade-in duration-300">
                weak error: use 8+ chars with letters, numbers & symbols
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            variant="gradient"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
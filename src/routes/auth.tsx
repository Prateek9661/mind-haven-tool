import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in to Velora — Your Calm Account" },
      {
        name: "description",
        content:
          "Sign in or create your Velora account with email, phone number or Google to save your profile and personalise your calm space.",
      },
      { property: "og:title", content: "Sign in to Velora" },
      {
        property: "og:description",
        content: "Create your Velora account with email, phone or Google and keep your sanctuary personal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/profile", replace: true });
  }, [loading, user, navigate]);

  const fail = (message: string) => toast.error(message);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return fail(error.message);
    void navigate({ to: "/profile", replace: true });
  };

  const signUp = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName.trim() },
      },
    });
    setBusy(false);
    if (error) return fail(error.message);
    if (!data.session) {
      toast.success("Almost there — check your email to confirm your account.");
      return;
    }
    void navigate({ to: "/profile", replace: true });
  };

  const sendOtp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setBusy(false);
    if (error) return fail(error.message);
    setOtpSent(true);
    toast.success("We sent you a code by SMS.");
  };

  const verifyOtp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: "sms",
    });
    setBusy(false);
    if (error) return fail(error.message);
    void navigate({ to: "/profile", replace: true });
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      return fail("Google sign-in didn't work. Please try again.");
    }
    if (result.redirected) return;
    setBusy(false);
    void navigate({ to: "/profile", replace: true });
  };

  return (
    <main className="sanctuary-bg flex min-h-screen flex-col items-center justify-center px-5 py-14">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link
            to="/"
            className="font-display text-lg font-light uppercase tracking-[0.42em] text-primary"
          >
            Velora
          </Link>
          <h1 className="mt-5 font-display text-3xl font-light text-foreground sm:text-4xl">
            Welcome back to your calm.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your email, phone number or Google.
          </p>
        </div>

        <div className="glass-card mt-8 px-6 py-7 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={signInWithGoogle}
            disabled={busy}
            className="min-h-11 w-full rounded-full"
          >
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-3 rounded-full">
              <TabsTrigger value="signin" className="rounded-full">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">
                Sign up
              </TabsTrigger>
              <TabsTrigger value="phone" className="rounded-full">
                Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-h-11 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 rounded-2xl"
                />
              </div>
              <Button
                onClick={signIn}
                disabled={busy || !email.trim() || !password}
                className="min-h-11 w-full rounded-full"
              >
                Sign in
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Your name</Label>
                <Input
                  id="signup-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={80}
                  className="min-h-11 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-h-11 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 rounded-2xl"
                />
              </div>
              <Button
                onClick={signUp}
                disabled={busy || !email.trim() || password.length < 6}
                className="min-h-11 w-full rounded-full"
              >
                Create account
              </Button>
            </TabsContent>

            <TabsContent value="phone" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 1234"
                  className="min-h-11 rounded-2xl"
                />
              </div>
              {otpSent ? (
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="min-h-11 rounded-2xl"
                  />
                </div>
              ) : null}
              <Button
                onClick={otpSent ? verifyOtp : sendOtp}
                disabled={busy || (otpSent ? otp.trim().length < 4 : phone.trim().length < 6)}
                className="min-h-11 w-full rounded-full"
              >
                {otpSent ? "Verify code" : "Send code"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Use the international format, e.g. +1 555 000 1234.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            Back to the sanctuary
          </Link>
        </p>
      </div>
      <Toaster />
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useT } from "@/lib/useT";
import { useAuth } from "@/lib/supabase/useAuth";
import { toast } from "sonner";

/**
 * Real email/password auth form (sign in + sign up) backed by Supabase.
 * Replaces the old one-click mock-login button.
 */
export function AuthForm() {
  const { t, locale } = useT();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const ar = locale === "ar";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signin") {
        const err = await signIn(email, password);
        if (err) {
          toast.error(err);
        } else {
          toast.success(ar ? "تم تسجيل الدخول" : "Signed in");
          router.replace("/");
        }
      } else if (mode === "forgot") {
        const { createClient } = await import("@/lib/supabase/client");
        const { error } = await createClient().auth.resetPasswordForEmail(
          email,
          { redirectTo: `${window.location.origin}/account/reset-password` },
        );
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(
            ar
              ? "تحقق من بريدك — أرسلنا رابط إعادة تعيين كلمة المرور."
              : "Check your email — we sent a password reset link.",
          );
          setMode("signin");
        }
      } else {
        const err = await signUp(email, password, fullName);
        if (err) {
          toast.error(err);
        } else {
          // Email confirmation is disabled, so signup signs the user in
          // immediately — send them straight to the home page.
          toast.success(ar ? "تم إنشاء حسابك بنجاح" : "Account created");
          router.replace("/");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const continueWithGoogle = async () => {
    if (busy) return;
    setBusy(true);
    // On success the browser redirects to Google, so we don't reset `busy`.
    const err = await signInWithGoogle();
    if (err) {
      toast.error(err);
      setBusy(false);
    }
  };

  return (
    <div className="container-h py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-md ring-1 ring-[var(--color-border)]"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
          <User className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-center font-display text-3xl font-semibold">
          {mode === "signin"
            ? t("login")
            : mode === "forgot"
              ? ar
                ? "استعادة كلمة المرور"
                : "Reset password"
              : ar
                ? "إنشاء حساب"
                : "Create account"}
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-4 text-start">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                {ar ? "الاسم الكامل" : "Full name"}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary-dark)]"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("email")}
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary-dark)]"
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                {ar ? "كلمة المرور" : "Password"}
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary-dark)]"
              />
            </div>
          )}
          {mode === "signin" && (
            <div className="text-end">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-[var(--color-primary-dark)] hover:underline"
              >
                {ar ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="btn btn-gold btn-lg w-full disabled:opacity-60"
          >
            {busy
              ? ar
                ? "جارٍ…"
                : "Please wait…"
              : mode === "signin"
                ? t("login")
                : mode === "forgot"
                  ? ar
                    ? "إرسال رابط الاستعادة"
                    : "Send reset link"
                  : ar
                    ? "إنشاء حساب"
                    : "Create account"}
          </button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
              <span className="h-px flex-1 bg-[var(--color-border)]" />
              {ar ? "أو" : "or"}
              <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-white py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-bg-secondary)] disabled:opacity-60"
            >
              <GoogleIcon />
              {ar ? "المتابعة عبر Google" : "Continue with Google"}
            </button>
          </>
        )}

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-[var(--color-primary-dark)] hover:underline"
        >
          {mode === "signin"
            ? ar
              ? "ليس لديك حساب؟ أنشئ حسابًا"
              : "No account? Create one"
            : ar
              ? "لديك حساب؟ سجّل الدخول"
              : "Have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}

/** Google "G" logo (lucide ships no brand icons). */
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

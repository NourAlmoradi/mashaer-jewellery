"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MailCheck, MailWarning } from "lucide-react";
import { useT } from "@/lib/useT";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Landing page for the Supabase signup-confirmation email link.
 * The email carries ?token_hash=...&type=signup which we verify here,
 * then redirect the (now signed-in) user to the home page.
 */
export default function ConfirmEmailPage() {
  const { locale } = useT();
  const router = useRouter();
  const ar = locale === "ar";
  const [status, setStatus] = useState<"verifying" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");

    if (!tokenHash) {
      setStatus("error");
      return;
    }

    supabase.auth
      .verifyOtp({
        type: type === "email_change" ? "email_change" : "signup",
        token_hash: tokenHash,
      })
      .then(({ error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStatus("error");
        } else {
          toast.success(
            ar
              ? "تم تأكيد بريدك الإلكتروني بنجاح"
              : "Email confirmed successfully",
          );
          router.replace("/");
        }
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-h py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-md ring-1 ring-[var(--color-border)]"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
          {status === "error" ? (
            <MailWarning className="h-7 w-7" />
          ) : (
            <MailCheck className="h-7 w-7" />
          )}
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold">
          {status === "error"
            ? ar
              ? "تعذّر تأكيد البريد"
              : "Confirmation failed"
            : ar
              ? "جارٍ تأكيد بريدك..."
              : "Confirming your email..."}
        </h1>
        {status === "error" ? (
          <div className="mt-4 space-y-3 text-sm text-[var(--color-ink-muted)]">
            <p>
              {ar
                ? "انتهت صلاحية الرابط أو تم استخدامه من قبل. حاول تسجيل الدخول، وإذا لم ينجح فأنشئ حسابًا من جديد."
                : "The link expired or was already used. Try signing in — if that fails, sign up again."}
            </p>
            {errorMsg && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
                dir="ltr"
              >
                {errorMsg}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            {ar ? "لحظات من فضلك..." : "One moment please..."}
          </p>
        )}
      </motion.div>
    </div>
  );
}

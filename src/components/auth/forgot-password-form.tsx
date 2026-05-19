"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES } from "@/lib/auth/config";
import {
  hasErrors,
  validateForgotPassword,
  type FieldErrors,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

function getRedirectUrl(path: string = "") {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  return `${baseUrl}${path}`;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateForgotPassword({ email });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getRedirectUrl(
        `${AUTH_ROUTES.callback}?next=${AUTH_ROUTES.resetPassword}`
      ),
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
    toast.success("Reset link sent! Check your inbox.");
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        description="We sent a password reset link to your inbox"
        footer={
          <Link
            href={AUTH_ROUTES.login}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-xl border bg-muted/40 px-6 py-10 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-7" />
          </span>
          <p className="text-sm text-muted-foreground">
            Open the link in <strong className="text-foreground">{email}</strong>{" "}
            to set a new password. The link expires after a short time.
          </p>
          <Button variant="outline" asChild className="mt-2">
            <Link href={AUTH_ROUTES.login}>Return to sign in</Link>
          </Button>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      description="We'll email you a link to reset your password"
      footer={
        <Link
          href={AUTH_ROUTES.login}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            disabled={loading}
          />
        </FormField>

        <Button type="submit" className="h-10 w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Sending link…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AUTH_ROUTES } from "@/lib/auth/config";

import {
  hasErrors,
  validateSignup,
  type FieldErrors,
} from "@/lib/auth/validation";

import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const nextErrors = validateSignup({
      fullName,
      email,
      password,
      confirmPassword,
    });

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) return;

    setLoading(true);

    try {
      const supabase = createClient();

      // SIGNUP USER

      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },

            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback`
                : undefined,
          },
        });

      if (error) {
        toast.error(error.message);
        return;
      }

      // CREATE PROFILE

      if (data?.user) {
        const { error: profileError } =
          await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              full_name: fullName.trim(),
              email: email.trim(),
            });

        if (profileError) {
          console.error(
            "Profile creation error:",
            profileError.message
          );
        }
      }

      toast.success(
        "Account created successfully! Please verify your email."
      );

      router.push(AUTH_ROUTES.login);
    } catch (err) {
      console.error(err);

      toast.error(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create an account"
      description="Get started with your AI workspace in seconds"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={AUTH_ROUTES.login}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <FormField
          id="fullName"
          label="Full Name"
          error={errors.fullName}
        >
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            aria-invalid={!!errors.fullName}
            disabled={loading}
          />
        </FormField>

        <FormField
          id="email"
          label="Email"
          error={errors.email}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            aria-invalid={!!errors.email}
            disabled={loading}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={errors.password}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            aria-invalid={!!errors.password}
            disabled={loading}
          />
        </FormField>

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          error={errors.confirmPassword}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            aria-invalid={
              !!errors.confirmPassword
            }
            disabled={loading}
          />
        </FormField>

        <Button
          type="submit"
          className="h-10 w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
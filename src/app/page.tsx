import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Bot, Shield, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(AUTH_ROUTES.dashboard);
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </span>
            AI Workspace
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href={AUTH_ROUTES.login}>Sign in</Link>
            </Button>
            <Button asChild>
              <Link href={AUTH_ROUTES.signup}>
                Get started
                <ArrowRight />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            AI-powered SaaS workspace
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Build, chat, and ship faster with your team
          </h1>
          <p className="text-lg text-muted-foreground">
            Secure authentication, persistent sessions, and a modern dashboard —
            ready for your AI features.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-11 px-6">
              <Link href={AUTH_ROUTES.signup}>
                Create free account
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 px-6">
              <Link href={AUTH_ROUTES.login}>Sign in</Link>
            </Button>
          </div>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="size-3.5" />
            Secured with Supabase Auth
          </p>
        </div>
      </main>
    </div>
  );
}

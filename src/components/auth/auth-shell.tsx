"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Sparkles, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: Sparkles,
    title: "AI-powered workspace",
    description: "Chat, documents, and insights in one place.",
  },
  {
    icon: Zap,
    title: "Fast & secure",
    description: "Enterprise-grade auth with session persistence.",
  },
  {
    icon: Bot,
    title: "Built for teams",
    description: "Collaborate with confidence on every project.",
  },
];

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-svh w-full"
    >
      <aside
        className={cn(
          "relative hidden w-[45%] flex-col justify-between overflow-hidden p-10 lg:flex",
          "bg-zinc-950 text-zinc-50"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.55_0.2_264/0.45),transparent)]"
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative z-10"
        >
          <Link href="/" className="inline-flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
              <Bot className="size-5" />
            </span>
            AI Workspace
          </Link>
        </motion.div>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Your intelligent workspace starts here.
            </h2>
            <p className="mt-3 max-w-md text-zinc-400">
              Sign in to access your dashboard, AI chat, and team tools.
            </p>
          </motion.div>

          <ul className="space-y-5">
            {features.map((feature, i) => (
              <motion.li
                key={feature.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex gap-3"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <feature.icon className="size-4" />
                </span>
                <motion.div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </motion.div>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} AI Workspace
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="mb-8 flex w-full max-w-md items-center gap-2 lg:hidden">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-5" />
          </span>
          <span className="font-semibold">AI Workspace</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {children}

          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground lg:text-left">
              {footer}
            </div>
          ) : null}
        </motion.div>
      </main>
    </motion.div>
  );
}

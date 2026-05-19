"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type GlassCardProps = HTMLMotionProps<"div"> & {
  hover?: boolean;
};

export function GlassCard({
  className,
  children,
  hover = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/50 shadow-lg shadow-black/5 backdrop-blur-xl",
        "dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20",
        hover &&
          "transition-shadow hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

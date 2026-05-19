"use client";

import React from "react";

interface AIStatsCardProps {
  title: string;
  value: string;
  description?: string;
  badge?: string;
}

export default function AnimatedCard({
  title,
  value,
  description,
  badge,
}: AIStatsCardProps) {
  return (
    <div
      className="
      relative
      rounded-2xl
      border
      border-zinc-800
      bg-zinc-900
      p-6
      shadow-lg
      transition-all
      hover:scale-[1.02]
      "
    >
      {badge && (
        <span
          className="
          absolute
          top-4
          right-4
          text-xs
          px-2
          py-1
          rounded-full
          bg-emerald-500/10
          text-emerald-400
          "
        >
          {badge}
        </span>
      )}

      <h2 className="text-sm text-zinc-400">
        {title}
      </h2>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-sm text-zinc-500">
          {description}
        </p>
      )}
    </div>
  );
}
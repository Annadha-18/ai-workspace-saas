"use client";

import React from "react";

interface AIStatsCardProps {
  title: string;
  value: string;
  description?: string;
}

export default function AnimatedCard({
  title,
  value,
  description,
}: AIStatsCardProps) {
  return (
    <div
      className="
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
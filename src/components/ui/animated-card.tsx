"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

interface AIStatsCardProps {
  title: string;
  value: string;
  description?: string;
  badge?: string;
}

export function AIStatsCard({
  title,
  value,
  description,
  badge,
}: AIStatsCardProps) {
  return (
    <CardContainer className="w-full">
      <CardBody className="relative group/card w-full sm:w-[22rem] rounded-xl p-6 border border-neutral-200 dark:border-white/[0.1] bg-white dark:bg-black">

        {/* Badge */}
        {badge && (
          <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
            {badge}
          </span>
        )}

        {/* Title */}
        <CardItem
          translateZ="40"
          className="text-sm text-neutral-500 dark:text-neutral-400"
        >
          {title}
        </CardItem>

        {/* Value */}
        <CardItem
          translateZ="80"
          className="text-3xl font-bold mt-2 text-neutral-900 dark:text-white"
        >
          {value}
        </CardItem>

        {/* Description */}
        {description && (
          <CardItem
            translateZ="60"
            className="text-xs mt-2 text-neutral-500 dark:text-neutral-400"
          >
            {description}
          </CardItem>
        )}
      </CardBody>
    </CardContainer>
  );
}
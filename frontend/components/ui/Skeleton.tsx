"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({
  className = "",
  style = {},
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("bg-surface-variant/60 animate-pulse rounded-lg", className)}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/50">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1 max-w-[120px]" />
        ))}
      </div>

      {/* Row Skeletons */}
      <div className="divide-y divide-outline-variant/10">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-6 py-4">
            <div className="w-9 h-9 rounded-full bg-surface-variant/60 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 max-w-[200px]" />
              <Skeleton className="h-3 w-1/2 max-w-[140px]" />
            </div>
            {Array.from({ length: cols - 1 }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1 hidden sm:block max-w-[100px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

"use client";

import React from "react";
import FaceIcon from "./FaceIcon";

interface FullScreenSplashProps {
  message?: string;
  progress?: number; // Optional 0-100 percentage. If undefined, runs indeterminate shimmer.
  brandName?: string;
}

export default function FullScreenSplash({
  message = "Cargando Volta...",
  progress,
  brandName = "Volta",
}: FullScreenSplashProps) {
  const isDeterminate = typeof progress === "number";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface text-on-surface transition-opacity duration-500 ease-in-out select-none"
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center space-y-6 max-w-xs text-center px-4">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm animate-pulse">
            <FaceIcon className="w-8 h-8" />
          </div>
          <span className="font-display font-bold text-title-lg tracking-tight text-on-surface">
            {brandName}
          </span>
        </div>

        {/* Sleek Linear Progress Bar */}
        <div className="w-44 h-1 bg-on-surface/15 rounded-full overflow-hidden relative">
          {isDeterminate ? (
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.max(4, progress))}%`,
                transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: "var(--color-primary, #006565)",
              }}
            />
          ) : (
            <div
              className="absolute top-0 bottom-0 w-1/2 rounded-full animate-indeterminate-slide"
              style={{ backgroundColor: "var(--color-primary, #006565)" }}
            />
          )}
        </div>

        {/* Status Message */}
        {message && (
          <p className="text-body-sm text-on-surface-variant font-medium animate-fade-in">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

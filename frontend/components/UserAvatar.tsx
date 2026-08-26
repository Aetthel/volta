"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  name?: string | null;
  surname?: string | null;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function getInitials(name?: string | null, surname?: string | null): string {
  const n = (name || "").trim();
  const s = (surname || "").trim();
  if (!n && !s) return "?";

  if (s) {
    return `${n.charAt(0)}${s.charAt(0)}`.toUpperCase();
  }

  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  surname,
  avatarUrl,
  size = "md",
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name, surname);
  const fullName = `${name || ""} ${surname || ""}`.trim();

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-xs font-bold",
    lg: "w-12 h-12 text-sm font-bold",
    xl: "w-14 h-14 text-base font-bold",
  };

  if (avatarUrl && !imgError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatarUrl}
        alt={fullName || "Avatar"}
        onError={() => setImgError(true)}
        className={cn(
          "rounded-full object-cover shrink-0 border border-outline-variant/40",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold tracking-wider shrink-0 select-none bg-primary/10 text-primary border border-primary/20",
        sizeClasses[size],
        className
      )}
      aria-label={fullName || "Usuario"}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;

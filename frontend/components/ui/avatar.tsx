"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarType = "person" | "business";

export interface AvatarProps {
  name: string;
  surname?: string | null;
  src?: string | null;
  type?: AvatarType;
  size?: AvatarSize;
  alt?: string;
  className?: string;
}

export interface AvatarGroupMember {
  id?: string;
  name: string;
  surname?: string | null;
  src?: string | null;
}

export interface AvatarGroupProps {
  members: AvatarGroupMember[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

// 7 Curated, 100% Solid Pastel Themes with Guaranteed Hex Values
export const PASTEL_PALETTES = [
  {
    name: "teal",
    bg: "#a7f3d0", // Pastel Mint/Teal
    text: "#064e3b",
  },
  {
    name: "lavender",
    bg: "#c7d2fe", // Pastel Lavender/Indigo
    text: "#312e81",
  },
  {
    name: "rose",
    bg: "#fecdd3", // Pastel Rose/Pink
    text: "#881337",
  },
  {
    name: "amber",
    bg: "#fde68a", // Pastel Peach/Amber
    text: "#78350f",
  },
  {
    name: "sky",
    bg: "#bae6fd", // Pastel Sky Blue
    text: "#0c4a6e",
  },
  {
    name: "purple",
    bg: "#e9d5ff", // Pastel Purple/Mauve
    text: "#581c87",
  },
  {
    name: "coral",
    bg: "#fed7aa", // Pastel Coral/Orange
    text: "#7c2d12",
  },
];

export function getInitials(name?: string | null, surname?: string | null, type: AvatarType = "person"): string {
  const n = (name || "").trim();
  const s = (surname || "").trim();
  if (!n && !s) return type === "business" ? "V" : "U";

  if (type === "business") {
    return n.charAt(0).toUpperCase() || "V";
  }

  if (s) {
    return `${n.charAt(0)}${s.charAt(0)}`.toUpperCase();
  }

  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
}

export function getPastelPalette(identifier: string) {
  if (!identifier) return PASTEL_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash * 31 + identifier.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % PASTEL_PALETTES.length;
  return PASTEL_PALETTES[index];
}

const SIZE_CLASSES: Record<AvatarSize, { container: string; text: string; overlap: string }> = {
  xs: { container: "w-6 h-6", text: "text-[10px]", overlap: "-ml-2" },
  sm: { container: "w-8 h-8", text: "text-xs font-bold", overlap: "-ml-2.5" },
  md: { container: "w-9 h-9 sm:w-10 sm:h-10", text: "text-xs sm:text-sm font-bold", overlap: "-ml-3 sm:-ml-3.5" },
  lg: { container: "w-14 h-14", text: "text-base font-bold", overlap: "-ml-4" },
  xl: { container: "w-20 h-20", text: "text-xl font-bold", overlap: "-ml-5" },
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  surname,
  src,
  type = "person",
  size = "md",
  alt,
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name, surname, type);
  const fullName = `${name || ""} ${surname || ""}`.trim();
  const palette = getPastelPalette(fullName || name || "Volta");
  const sizeConfig = SIZE_CLASSES[size];

  const shapeClass = type === "business" ? "rounded-xl" : "rounded-full";

  if (src && !imgError) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-surface-container select-none",
          shapeClass,
          sizeConfig.container,
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || fullName || "Avatar"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
      className={cn(
        "relative flex items-center justify-center font-bold tracking-wider shrink-0 select-none",
        shapeClass,
        sizeConfig.container,
        sizeConfig.text,
        className
      )}
      aria-label={fullName || "Avatar"}
    >
      {initials}
    </div>
  );
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  members,
  max = 3,
  size = "md",
  className,
}) => {
  const visibleMembers = members.slice(0, max);
  const extraCount = Math.max(0, members.length - max);
  const sizeConfig = SIZE_CLASSES[size];

  return (
    <div className={cn("inline-flex items-center select-none", className)}>
      {visibleMembers.map((member, idx) => (
        <div
          key={member.id || idx}
          style={{ zIndex: idx + 1 }}
          className={cn(
            "relative shrink-0 rounded-full border-2 border-surface shadow-xs overflow-hidden",
            idx > 0 && sizeConfig.overlap,
            sizeConfig.container
          )}
        >
          <Avatar
            name={member.name}
            surname={member.surname}
            src={member.src}
            type="person"
            size={size}
            className="w-full h-full border-none shadow-none"
          />
        </div>
      ))}

      {extraCount > 0 && (
        <div
          style={{ zIndex: visibleMembers.length + 1 }}
          className={cn(
            "relative rounded-full border-2 border-surface bg-neutral-900 dark:bg-neutral-800 text-white font-bold flex items-center justify-center shrink-0 shadow-xs",
            sizeConfig.overlap,
            sizeConfig.container,
            sizeConfig.text
          )}
          title={`${extraCount} más`}
        >
          +{extraCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;

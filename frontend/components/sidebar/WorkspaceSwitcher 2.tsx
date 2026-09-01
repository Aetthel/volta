"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Settings } from "lucide-react";

interface WorkspaceSwitcherProps {
  businessName: string;
  businessLogo?: string | null;
  planLabel: string;
  isCollapsed: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  businessName,
  businessLogo,
  planLabel,
  isCollapsed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const initial = businessName.trim().charAt(0).toUpperCase() || "B";

  return (
    <div className="relative">
      <div
        onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-2.5 py-2.5 mb-2 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors select-none group ${
          isCollapsed ? "justify-center" : ""
        }`}
        title={businessName}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden">
            {businessLogo ? (
              <Image
                src={businessLogo}
                alt={businessName}
                width={36}
                height={36}
                unoptimized
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-sm font-semibold leading-tight text-on-surface truncate max-w-[140px]">
                {businessName}
              </span>
              <span className="text-xs font-medium text-on-surface-variant/80 leading-tight mt-0.5">
                {planLabel}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown
            className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-colors shrink-0"
            strokeWidth={1.75}
          />
        )}
      </div>

      {isOpen && !isCollapsed && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[58px] left-0 w-full bg-white border border-outline-variant/60 rounded-xl shadow-xl z-50 py-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3.5 py-2 mx-1 text-sm rounded-lg bg-primary/10 text-primary font-semibold">
              {businessName} ({planLabel})
            </div>
            <div className="h-px bg-outline-variant/40 my-1 mx-2" />
            <Link
              href="/ajustes"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 mx-1 text-sm text-on-surface-variant hover:bg-primary/5 hover:text-primary rounded-lg cursor-pointer flex items-center gap-2 transition-colors font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Ajustes de Cuenta</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

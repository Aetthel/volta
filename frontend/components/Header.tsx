"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Settings,
  LogOut,
  Users,
  Check,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Avatar, AvatarGroup } from "@/components/ui/volta-ui";

interface HeaderProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  hasNotifications?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "JEFE":
      return "Jefe de Negocio";
    case "EMPLEADO":
      return "Profesional";
    default:
      return role || "Usuario";
  }
}

function HeaderContent({}: HeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [workerPhoto, setWorkerPhoto] = useState<string | null>(null);

  const businessId = session?.user?.businessId;
  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.name || "Usuario";
  const currentUserEmail = session?.user?.email || "";
  const currentUserRole = session?.user?.role || "EMPLEADO";

  // Load custom photo from localStorage if present
  useEffect(() => {
    const loadPhoto = () => {
      if (typeof window !== "undefined") {
        const savedPhoto = localStorage.getItem("stylist_worker_photo");
        setWorkerPhoto(savedPhoto || null);
      }
    };
    loadPhoto();
    window.addEventListener("stylist_worker_photo_changed", loadPhoto);
    return () => {
      window.removeEventListener("stylist_worker_photo_changed", loadPhoto);
    };
  }, []);

  // Fetch team members if businessId is available
  const fetchTeam = useCallback(async () => {
    if (!businessId || businessId === "mock-business-id") return;
    try {
      const res = await apiClient.team.getAll<TeamMember[]>(businessId);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTeamMembers(res.data);
      }
    } catch (e) {
      console.error("Error loading team members in header:", e);
    }
  }, [businessId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Merge current user with team members list
  const displayMembers = useMemo(() => {
    if (teamMembers.length === 0) {
      return [
        {
          id: currentUserId || "current",
          name: currentUserName,
          email: currentUserEmail,
          role: currentUserRole,
          src: workerPhoto || undefined,
        },
      ];
    }

    const formatted = teamMembers.map((m) => {
      const isCurrent = m.id === currentUserId || m.email === currentUserEmail;
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        src: isCurrent && workerPhoto ? workerPhoto : (m.avatarUrl || undefined),
      };
    });

    // Ensure current user is first
    const currentIdx = formatted.findIndex((m) => m.id === currentUserId || m.email === currentUserEmail);
    if (currentIdx > 0) {
      const [current] = formatted.splice(currentIdx, 1);
      formatted.unshift(current);
    }
    return formatted;
  }, [teamMembers, currentUserId, currentUserName, currentUserEmail, currentUserRole, workerPhoto]);

  return (
    <div className="relative shrink-0 select-none">
      {/* ═══════════════ RESCALABLE AVATAR STACK ═══════════════ */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative inline-flex items-center rounded-full cursor-pointer outline-none border-none p-0 bg-transparent"
        title="Perfil y Miembros del Equipo"
        aria-label="Perfil de usuario"
        aria-expanded={isDropdownOpen}
      >
        <AvatarGroup
          members={displayMembers}
          max={3}
          size="md"
        />
      </button>

      {/* ═══════════════ PROFILE & TEAM DROPDOWN ═══════════════ */}
      {isDropdownOpen && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />

          <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right overflow-hidden">
            {/* Active User Header Card */}
            <div className="px-4 py-3 border-b border-outline-variant/30 bg-surface-container-low/40">
              <div className="flex items-center gap-3">
                <Avatar
                  name={currentUserName}
                  src={workerPhoto}
                  type="person"
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-on-surface truncate leading-snug">
                    {currentUserName}
                  </h4>
                  <p className="text-xs text-on-surface-variant/70 truncate">
                    {currentUserEmail}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold tracking-wide uppercase">
                    {getRoleLabel(currentUserRole)}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Members List (if multiple members exist) */}
            {displayMembers.length > 1 && (
              <div className="py-2 px-2 border-b border-outline-variant/20">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/60 flex items-center justify-between">
                  <span>Equipo ({displayMembers.length})</span>
                  <Link
                    href="/equipo"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-primary hover:underline lowercase text-[11px] font-normal"
                  >
                    ver todos
                  </Link>
                </div>
                <div className="space-y-0.5 mt-1 max-h-36 overflow-y-auto no-scrollbar">
                  {displayMembers.map((member, i) => {
                    const isCurrent = member.id === currentUserId || member.email === currentUserEmail;
                    return (
                      <div
                        key={member.id || i}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ${
                          isCurrent
                            ? "bg-primary/[0.06] text-primary font-semibold"
                            : "text-on-surface hover:bg-surface-container-low/60 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Avatar
                            name={member.name}
                            src={member.src}
                            type="person"
                            size="xs"
                          />
                          <span className="truncate">{member.name}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Activo
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="py-1 px-1">
              <Link
                href="/equipo"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-variant/50 hover:text-primary rounded-xl transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-on-surface-variant/70" />
                <span>Gestión de Equipo</span>
              </Link>

              <Link
                href="/ajustes"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-variant/50 hover:text-primary rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-on-surface-variant/70" />
                <span>Ajustes de Cuenta</span>
              </Link>
            </div>

            {/* Sign Out Action */}
            <div className="pt-1 border-t border-outline-variant/20 px-1">
              <button
                type="button"
                onClick={async () => {
                  setIsDropdownOpen(false);
                  if (
                    session?.user?.businessId &&
                    session?.user?.subscriptionStatus === "DEMO_SANDBOX"
                  ) {
                    try {
                      await fetch(`/api/backend/demo?businessId=${session.user.businessId}`, {
                        method: "DELETE",
                      });
                    } catch (e) {
                      // Best-effort cleanup
                    }
                  }
                  signOut({ callbackUrl: "/login" });
                  localStorage.removeItem("stylist_worker_photo");
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-error hover:bg-error-container/20 rounded-xl transition-colors w-full cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-error" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Header(props: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === "undefined") return null;
  return <HeaderContent {...props} />;
}

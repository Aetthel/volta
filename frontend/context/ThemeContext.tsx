"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  ThemePreferences,
  ThemeColorKey,
  FontSizeKey,
  BorderRadiusKey,
  DEFAULT_THEME_PREFERENCES,
  getThemeColor,
  getFontSizeLevel,
  getBorderRadiusLevel,
  setThemeCookie,
  applyThemePreferences,
} from "@/lib/theme";
import { apiClient } from "@/lib/apiClient";

export interface ThemeContextValue {
  themeColor: ThemeColorKey;
  fontSizeLevel: FontSizeKey;
  borderRadiusLevel: BorderRadiusKey;
  isSaving: boolean;
  updateTheme: (
    newPrefs: Partial<ThemePreferences>,
    options?: { persistToDb?: boolean; businessId?: string }
  ) => Promise<boolean>;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  initialPreferences?: ThemePreferences;
  children: React.ReactNode;
}

export function ThemeProvider({
  initialPreferences = DEFAULT_THEME_PREFERENCES,
  children,
}: ThemeProviderProps) {
  const { data: session, update: updateSession } = useSession();
  const [preferences, setPreferences] = useState<ThemePreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialized = useRef(false);

  // Sync with initialPreferences or session preferences on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    // Preference hierarchy: active state > session > initial SSR
    const sessionColor = session?.user?.themeColor;
    const sessionFont = session?.user?.fontSizeLevel;
    const sessionRadius = session?.user?.borderRadiusLevel;

    setPreferences((prev) => {
      const effectiveColor = getThemeColor(sessionColor || prev.themeColor);
      const effectiveFont = getFontSizeLevel(sessionFont || prev.fontSizeLevel);
      const effectiveRadius = getBorderRadiusLevel(sessionRadius || prev.borderRadiusLevel);

      const merged: ThemePreferences = {
        themeColor: effectiveColor,
        fontSizeLevel: effectiveFont,
        borderRadiusLevel: effectiveRadius,
      };

      applyThemePreferences(root, merged);
      setThemeCookie(merged);
      isInitialized.current = true;
      return merged;
    });
  }, [
    session?.user?.themeColor,
    session?.user?.fontSizeLevel,
    session?.user?.borderRadiusLevel,
  ]);

  const updateTheme = useCallback(
    async (
      newPrefs: Partial<ThemePreferences>,
      options?: { persistToDb?: boolean; businessId?: string }
    ): Promise<boolean> => {
      const prev = preferences;
      const updated: ThemePreferences = {
        themeColor: newPrefs.themeColor ? getThemeColor(newPrefs.themeColor) : prev.themeColor,
        fontSizeLevel: newPrefs.fontSizeLevel
          ? getFontSizeLevel(newPrefs.fontSizeLevel)
          : prev.fontSizeLevel,
        borderRadiusLevel: newPrefs.borderRadiusLevel
          ? getBorderRadiusLevel(newPrefs.borderRadiusLevel)
          : prev.borderRadiusLevel,
      };

      // 1. Immediate optimistic UI update & cookie sync
      setPreferences(updated);
      if (typeof document !== "undefined") {
        applyThemePreferences(document.documentElement, updated);
        setThemeCookie(updated);
      }

      // 2. Persist to DB if requested or businessId available
      const shouldPersist = options?.persistToDb !== false;
      const targetBusinessId = options?.businessId || session?.user?.businessId;

      if (shouldPersist && targetBusinessId && targetBusinessId !== "mock-business-id") {
        setIsSaving(true);
        try {
          const payload: Record<string, string> = {};
          if (newPrefs.themeColor) payload.themeColor = updated.themeColor;
          if (newPrefs.fontSizeLevel) payload.fontSizeLevel = updated.fontSizeLevel;
          if (newPrefs.borderRadiusLevel) payload.borderRadiusLevel = updated.borderRadiusLevel;

          const res = await apiClient.business.update(targetBusinessId, payload);
          if (res.error) {
            throw new Error(res.error);
          }

          // 3. Synchronize NextAuth session JWT
          if (updateSession) {
            await updateSession({
              themeColor: updated.themeColor,
              fontSizeLevel: updated.fontSizeLevel,
              borderRadiusLevel: updated.borderRadiusLevel,
              user: {
                ...session?.user,
                themeColor: updated.themeColor,
                fontSizeLevel: updated.fontSizeLevel,
                borderRadiusLevel: updated.borderRadiusLevel,
              },
            });
          }

          setIsSaving(false);
          return true;
        } catch (err) {
          console.error("[ThemeContext] Error saving theme to database:", err);
          // Rollback on error
          setPreferences(prev);
          if (typeof document !== "undefined") {
            applyThemePreferences(document.documentElement, prev);
            setThemeCookie(prev);
          }
          setIsSaving(false);
          return false;
        }
      }

      return true;
    },
    [preferences, session, updateSession]
  );

  const resetToDefault = useCallback(() => {
    updateTheme(DEFAULT_THEME_PREFERENCES);
  }, [updateTheme]);

  return (
    <ThemeContext.Provider
      value={{
        themeColor: preferences.themeColor,
        fontSizeLevel: preferences.fontSizeLevel,
        borderRadiusLevel: preferences.borderRadiusLevel,
        isSaving,
        updateTheme,
        resetToDefault,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

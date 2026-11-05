"use client";
import { useEffect } from "react";
import type { AppearancePreferences } from "@/modules/student/features/settings/types";
export function ApplyAppearance({
  preferences,
}: {
  preferences: AppearancePreferences;
}) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        preferences.theme === "dark" ||
          (preferences.theme === "system" && media.matches),
      );
    apply();
    media.addEventListener("change", apply);
    return () => {
      media.removeEventListener("change", apply);
      document.documentElement.classList.remove("dark");
    };
  }, [preferences.theme]);
  return null;
}

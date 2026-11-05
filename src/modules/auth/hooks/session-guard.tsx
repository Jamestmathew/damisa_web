"use client";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import type { SessionState } from "@/shared/security/session-state";
import { IDLE_SECONDS } from "@/shared/security/policy";
const signal = "damisa-session-change";
function subscribe(notify: () => void) {
  window.addEventListener(signal, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(signal, notify);
    window.removeEventListener("storage", notify);
  };
}
export function SessionGuard({
  state,
  children,
}: {
  state: SessionState | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const protectedPage =
    /^\/(student|tutor|admin|super-admin|settings)(\/|$)/.test(pathname);
  const key = state ? `damisa.tab.${state.id}` : "";
  const ready = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return (
          !!state &&
          (state.remember || sessionStorage.getItem(key) === "active")
        );
      } catch {
        return false;
      }
    },
    () => !!state?.remember,
  );
  useEffect(() => {
    if (!state || !protectedPage) return;
    let ending = false;
    let pending = false;
    let lastSent = 0;
    let retryAt = 0;
    let trailing: ReturnType<typeof setTimeout> | undefined;
    const activityKey = `damisa.activity.${state.id}`;
    const endKey = `damisa.ended.${state.id}`;
    function notify() {
      window.dispatchEvent(new Event(signal));
    }
    async function end(reason: string) {
      if (ending) return;
      ending = true;
      try {
        sessionStorage.removeItem(key);
        localStorage.setItem(endKey, "1");
      } catch {
        /* Server expiry remains authoritative. */
      } finally {
        notify();
      }
      try {
        const response = await fetch("/api/session/end", {
          method: "POST",
          headers: { "x-session-id": state!.id },
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) {
          window.location.replace("/session-ended");
          return;
        }
      } catch {
        window.location.replace("/session-ended");
        return;
      }
      window.location.replace(`/login?reason=${reason}`);
    }
    let lastActivity = state.idleExpiresAt - IDLE_SECONDS * 1000;
    if (state.remember) {
      try {
        sessionStorage.removeItem("damisa.login.pending");
      } catch {
        /* Remembered sessions do not depend on browser tab storage. */
      }
    }
    try {
      if (!state.remember && sessionStorage.getItem(key) !== "active") {
        const start = Number(sessionStorage.getItem("damisa.login.pending"));
        if (!start || Date.now() - start > 120000) {
          void end("tab_closed");
          return;
        }
        sessionStorage.removeItem("damisa.login.pending");
        sessionStorage.setItem(key, "active");
        notify();
      }
    } catch {
      void end("tab_unavailable");
      return;
    }
    if (!state.remember) {
      try {
        const stored = Number(localStorage.getItem(activityKey));
        if (stored > 0) lastActivity = stored;
      } catch {
        /* Tab-local activity still works without shared storage. */
      }
    }
    function deadline() {
      if (state!.remember) return state!.expiresAt;
      try {
        const value = Number(localStorage.getItem(activityKey));
        if (value > 0) lastActivity = Math.max(lastActivity, value);
      } catch {
        /* Use the local deadline. */
      }
      return state!.remember
        ? state!.expiresAt
        : Math.min(lastActivity + IDLE_SECONDS * 1000, state!.expiresAt);
    }
    async function sendActivity() {
      if (ending || pending || state!.remember) return;
      if (Date.now() >= deadline()) {
        void end("idle");
        return;
      }
      if (Date.now() < retryAt) return;
      pending = true;
      lastSent = Date.now();
      try {
        const response = await fetch("/api/session/activity", {
          method: "POST",
          headers: { "x-session-id": state!.id },
          credentials: "same-origin",
          cache: "no-store",
        });
        if (response.status === 401) {
          void end("idle");
          return;
        }
        if (response.status === 409) {
          ending = true;
          sessionStorage.removeItem(key);
          notify();
          window.location.replace("/session-ended");
          return;
        }
        if (response.status === 429)
          retryAt =
            Date.now() +
            Math.max(1, Number(response.headers.get("Retry-After")) || 30) *
              1000;
      } catch {
        /* A failed update never renews the server-signed idle cookie. */
      } finally {
        pending = false;
      }
    }
    function activity() {
      if (ending || state!.remember || document.visibilityState !== "visible")
        return;
      if (Date.now() >= deadline()) {
        void end("idle");
        return;
      }
      lastActivity = Date.now();
      try {
        localStorage.setItem(activityKey, String(lastActivity));
      } catch {
        /* Keep activity in this tab if storage is unavailable. */
      }
      if (Date.now() - lastSent >= 30000) void sendActivity();
      else if (!trailing)
        trailing = setTimeout(
          () => {
            trailing = undefined;
            void sendActivity();
          },
          Math.max(1, 30000 - (Date.now() - lastSent)),
        );
    }
    function check() {
      if (Date.now() >= deadline())
        void end(state!.remember ? "expired" : "idle");
      else {
        try {
          if (localStorage.getItem(endKey) === "1") {
            ending = true;
            sessionStorage.removeItem(key);
            notify();
            window.location.replace("/session-ended");
          }
        } catch {
          /* Continue normal checks. */
        }
      }
    }
    const events = [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "touchstart",
    ];
    for (const event of events)
      window.addEventListener(event, activity, { passive: true });
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    const timer = setInterval(check, 1000);
    check();
    return () => {
      clearInterval(timer);
      if (trailing) clearTimeout(trailing);
      for (const event of events) window.removeEventListener(event, activity);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [state, key, protectedPage]);
  if (state && protectedPage && !ready)
    return (
      <div role="status" className="p-8 text-center">
        Checking your session…
      </div>
    );
  return children;
}

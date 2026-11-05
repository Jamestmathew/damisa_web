/**
 * Auth Module — Public API
 *
 * Everything outside `src/modules/auth` should import from this barrel
 * (or from `@/modules/auth/lib` for server-only route guards), not reach
 * into internal files directly. This keeps the module's internals free
 * to change without breaking consumers.
 */

export * from "./types";
export * from "./constants";
export * from "./validation";
export * from "./components/ui";
export * from "./components/forms";
export * from "./hooks";

// Server actions and server-only session/session-guard helpers are
// re-exported from their own entry points (actions, lib) rather than here,
// since importing them from a barrel that also exports client components
// would pull "use server"/"server-only" boundaries into client bundles.

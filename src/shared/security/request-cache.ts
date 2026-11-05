import "server-only";
import { cookies } from "next/headers";
// The key is Next's request-local cookie store object, never a token/user ID.
// Weak keys are collected after requests; authentication is never shared across requests.
const requests = new WeakMap<
  object,
  Map<symbol, Map<string, Promise<unknown>>>
>();
export function cacheRequest<Args extends unknown[], Result>(
  operation: (...args: Args) => Promise<Result>,
) {
  const namespace = Symbol();
  return async (...args: Args): Promise<Result> => {
    const request = await cookies();
    let cache = requests.get(request);
    if (!cache) {
      cache = new Map();
      requests.set(request, cache);
    }
    let entries = cache.get(namespace);
    if (!entries) {
      entries = new Map();
      cache.set(namespace, entries);
    }
    const key = JSON.stringify(args);
    let pending = entries.get(key);
    if (!pending) {
      pending = operation(...args);
      entries.set(key, pending);
    }
    return pending as Promise<Result>;
  };
}
export async function clearRequestCache() {
  requests.delete(await cookies());
}

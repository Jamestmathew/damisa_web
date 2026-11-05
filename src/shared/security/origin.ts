/** Use the incoming Host: Next may expose an internal localhost request URL. */
export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const value = new URL(origin);
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    const protocol =
      process.env.NODE_ENV === "production" ? "https:" : url.protocol;
    return (
      value.host.toLowerCase() === host.toLowerCase() &&
      value.protocol === protocol
    );
  } catch {
    return false;
  }
}

/** Shared by session signing, verification and deployment validation. */
export class SessionConfigurationError extends Error {
  constructor() {
    super("SESSION_SECRET must contain at least 32 characters.");
    this.name = "SessionConfigurationError";
  }
}
export function sessionSigningKey(value: string | undefined): Uint8Array {
  if (!value || value.trim().length < 32) throw new SessionConfigurationError();
  return new TextEncoder().encode(value);
}

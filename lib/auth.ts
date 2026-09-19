import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "imehappen_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type Role = "superadmin" | "admin" | "client";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

/** Staff = superadmin or admin. Only staff can reach /admin and its APIs. */
export function isStaffRole(role: string | undefined | null): boolean {
  return role === "superadmin" || role === "admin";
}

function getSecretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const key = getSecretKey();
  if (!key) throw new Error("AUTH_SECRET is not set");

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const key = getSecretKey();
  if (!key) return null;

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return verifySessionToken(token, key);
}

/** Shared by middleware (edge) and getSession — verifies a JWT string. */
export async function verifySessionToken(
  token: string,
  key?: Uint8Array
): Promise<SessionPayload | null> {
  const secret = key ?? getSecretKey();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = String(payload.role ?? "client");
    return {
      userId: String(payload.userId ?? ""),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: role === "superadmin" || role === "admin" ? (role as Role) : "client",
    };
  } catch {
    return null;
  }
}

export function sessionCookieName(): string {
  return SESSION_COOKIE;
}

/**
 * Returns the current session when the caller has staff privileges,
 * otherwise null. Used by every /api/admin route.
 */
export async function requireStaffSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || !isStaffRole(session.role)) return null;
  return session;
}

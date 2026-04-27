import crypto from "node:crypto";

import { cookies } from "next/headers";

const COOKIE_NAME = "veridicte_admin";

function getSecret() {
  return (
    process.env.ADMIN_COOKIE_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "change-me"
  );
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function verify(raw: string | undefined) {
  if (!raw) return false;

  const [token, signature] = raw.split(".");
  if (!token || !signature) return false;

  return sign(token) === signature;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const token = `admin:${Date.now()}`;
  cookieStore.set(COOKIE_NAME, `${token}.${sign(token)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export const setAdminSession = createAdminSession;

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verify(cookieStore.get(COOKIE_NAME)?.value);
}

export async function getAdminSession() {
  const authenticated = await isAdminAuthenticated();
  return authenticated ? { authenticated: true } : null;
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error("Unauthorized");
  }
}

export function validateAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return password === "admin-demo";
  }
  return password === expected;
}

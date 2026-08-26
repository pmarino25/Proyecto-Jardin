import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SECRET = process.env.SESSION_SECRET || "cambiar-este-secreto-en-produccion";

export function createAdminToken(): string {
  return jwt.sign({ role: "admin" }, SECRET, { expiresIn: "30d" });
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = jwt.verify(token, SECRET) as { role?: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export async function setAdminCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };

import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";

// Devuelve null si está todo OK, o una respuesta 401 para cortar el handler.
// Uso: const denied = await requireAdmin(); if (denied) return denied;
export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await isAdminLoggedIn();
  if (!ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

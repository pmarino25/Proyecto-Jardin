import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD || "admin123";

  if (password !== expected) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = await getDb();
  const submissions = await db.all(
    `SELECT id, created_at, status, contact_name, contact_phone, space_type, style, payment_status, generated_image_data, generated_image_error
     FROM submissions ORDER BY created_at DESC`
  );
  return NextResponse.json({ submissions });
}

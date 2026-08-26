import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const db = await getDb();
  const submission = await db.get(`SELECT * FROM submissions WHERE id = ?`, [
    id,
  ]);
  if (!submission) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const quotes = await db.all(
    `SELECT * FROM quotes WHERE submission_id = ? ORDER BY created_at DESC`,
    [id]
  );

  return NextResponse.json({ submission, quotes });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = ["pendiente", "cotizada", "vendida", "descartada"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const db = await getDb();
  await db.run(`UPDATE submissions SET status = ? WHERE id = ?`, [status, id]);

  return NextResponse.json({ ok: true });
}

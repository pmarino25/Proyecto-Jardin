import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const { name, description, category, price, unit, active } = body;

  const db = await getDb();
  await db.run(
    `UPDATE products SET name = ?, description = ?, category = ?, price = ?, unit = ?, active = ? WHERE id = ?`,
    [
      name,
      description || "",
      category || "",
      Number(price),
      unit || "unidad",
      active ? 1 : 0,
      id,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const db = await getDb();
  // Baja lógica en vez de borrar, para no romper cotizaciones ya emitidas
  // que referencian este producto.
  await db.run(`UPDATE products SET active = 0 WHERE id = ?`, [id]);

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = await getDb();
  const products = await db.all(
    `SELECT * FROM products ORDER BY category, name`
  );
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { name, description, category, price, unit } = body;

  if (!name || price === undefined || price === null) {
    return NextResponse.json(
      { error: "Nombre y precio son obligatorios" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const result = await db.run(
    `INSERT INTO products (name, description, category, price, unit, active) VALUES (?, ?, ?, ?, ?, 1)`,
    [name, description || "", category || "", Number(price), unit || "unidad"]
  );

  return NextResponse.json({ id: result.lastInsertRowid });
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

// Endpoint público (sin auth): el cliente accede a su propuesta a través de
// un link que le enviamos, no hace falta que tenga cuenta.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const quote = await db.get(`SELECT * FROM quotes WHERE id = ?`, [id]);
  if (!quote) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const items = await db.all(
    `SELECT * FROM quote_items WHERE quote_id = ? ORDER BY id`,
    [id]
  );

  const submission = await db.get(
    `SELECT contact_name, space_type, style, generated_image_data FROM submissions WHERE id = ?`,
    [quote.submission_id]
  );

  return NextResponse.json({ quote, items, submission });
}

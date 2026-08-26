import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export const runtime = "nodejs";

interface QuoteItemInput {
  productId?: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { submissionId, notes, items } = body as {
    submissionId: number;
    notes?: string;
    items: QuoteItemInput[];
  };

  if (!submissionId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Faltan datos de la cotización" },
      { status: 400 }
    );
  }

  const total = items.reduce(
    (sum, it) => sum + Number(it.quantity) * Number(it.unitPrice),
    0
  );

  const db = await getDb();
  const quoteResult = await db.run(
    `INSERT INTO quotes (submission_id, notes, total_amount) VALUES (?, ?, ?)`,
    [submissionId, notes || "", total]
  );
  const quoteId = quoteResult.lastInsertRowid;

  for (const item of items) {
    const subtotal = Number(item.quantity) * Number(item.unitPrice);
    await db.run(
      `INSERT INTO quote_items (quote_id, product_id, description, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        quoteId,
        item.productId || null,
        item.description,
        Number(item.quantity),
        Number(item.unitPrice),
        subtotal,
      ]
    );
  }

  await db.run(`UPDATE submissions SET status = 'cotizada' WHERE id = ?`, [
    submissionId,
  ]);

  return NextResponse.json({ id: quoteId, totalAmount: total });
}

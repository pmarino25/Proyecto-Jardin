import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import {
  createPreference,
  getAppBaseUrl,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const db = await getDb();
  const quote = await db.get(`SELECT * FROM quotes WHERE id = ?`, [id]);
  if (!quote) {
    return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
  }

  const submission = await db.get(
    `SELECT * FROM submissions WHERE id = ?`,
    [quote.submission_id]
  );

  if (!isMercadoPagoConfigured()) {
    // Modo demo: no hay cuenta de Mercado Pago conectada todavía. Devolvemos
    // el link público a la propuesta, donde en producción estaría el botón
    // de pago.
    const baseUrl = getAppBaseUrl(request);
    const link = `${baseUrl}/propuesta/${id}`;
    await db.run(`UPDATE quotes SET payment_link = ? WHERE id = ?`, [
      link,
      id,
    ]);
    return NextResponse.json({ link, demoMode: true });
  }

  const baseUrl = getAppBaseUrl(request);
  const preference = await createPreference({
    title: `Propuesta de jardín/patio - ${submission?.contact_name || "cliente"}`,
    amount: quote.total_amount,
    externalReference: `quote-${id}`,
    backUrlSuccess: `${baseUrl}/propuesta/${id}`,
    backUrlFailure: `${baseUrl}/propuesta/${id}?pago=fallido`,
    backUrlPending: `${baseUrl}/propuesta/${id}?pago=pendiente`,
    notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
  });

  await db.run(
    `UPDATE quotes SET mp_preference_id = ?, payment_link = ? WHERE id = ?`,
    [preference.id, preference.initPoint, id]
  );

  return NextResponse.json({ link: preference.initPoint, demoMode: false });
}

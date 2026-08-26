import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getPayment } from "@/lib/mercadopago";
import { runGenerationForSubmission } from "@/lib/runGeneration";

export const runtime = "nodejs";

// Mercado Pago notifica pagos acá. Puede llegar como query params
// (?type=payment&data.id=...) o en el body, según el tipo de integración.
// Ver: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/notifications/webhooks
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    let paymentId =
      url.searchParams.get("data.id") || url.searchParams.get("id");
    const type = url.searchParams.get("type") || url.searchParams.get("topic");

    if (!paymentId) {
      // Intentar leer del body como fallback.
      const body = await request.json().catch(() => null);
      paymentId = body?.data?.id || body?.id || null;
    }

    if (!paymentId || (type && type !== "payment")) {
      // Puede ser una notificación de otro tipo (merchant_order, etc.) que
      // no nos interesa procesar.
      return NextResponse.json({ received: true });
    }

    const payment = await getPayment(String(paymentId));

    if (payment.status !== "approved" || !payment.externalReference) {
      return NextResponse.json({ received: true, status: payment.status });
    }

    const db = await getDb();
    const ref = payment.externalReference;

    if (ref.startsWith("submission-")) {
      const submissionId = Number(ref.replace("submission-", ""));
      const submission = await db.get(
        `SELECT * FROM submissions WHERE id = ?`,
        [submissionId]
      );
      if (submission && submission.payment_status !== "pagado") {
        await db.run(
          `UPDATE submissions SET payment_status = 'pagado', mp_payment_id = ? WHERE id = ?`,
          [payment.id, submissionId]
        );
        await runGenerationForSubmission(submissionId);
      }
    } else if (ref.startsWith("quote-")) {
      const quoteId = Number(ref.replace("quote-", ""));
      const quote = await db.get(`SELECT * FROM quotes WHERE id = ?`, [
        quoteId,
      ]);
      if (quote && quote.payment_status !== "pagado") {
        await db.run(
          `UPDATE quotes SET payment_status = 'pagado', mp_payment_id = ? WHERE id = ?`,
          [payment.id, quoteId]
        );
        await db.run(`UPDATE submissions SET status = 'vendida' WHERE id = ?`, [
          quote.submission_id,
        ]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Mercado Pago error:", err);
    // Devolvemos 200 igual para que Mercado Pago no reintente en loop por
    // errores nuestros; el error queda logueado para revisar manualmente.
    return NextResponse.json({ received: true, error: true });
  }
}

// Mercado Pago a veces prueba el endpoint con GET.
export async function GET() {
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { DESIRED_ELEMENTS } from "@/lib/options";
import { runGenerationForSubmission } from "@/lib/runGeneration";
import {
  createPreference,
  getAppBaseUrl,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago";

export const runtime = "nodejs";

const PROJECT_PRICE = Number(process.env.PROJECT_PRICE || 10000);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const photo = formData.get("photo") as File | null;
    const spaceType = String(formData.get("spaceType") || "");
    const style = String(formData.get("style") || "");
    const budget = String(formData.get("budget") || "");
    const comments = String(formData.get("comments") || "");
    const contactName = String(formData.get("contactName") || "");
    const contactPhone = String(formData.get("contactPhone") || "");
    const contactEmail = String(formData.get("contactEmail") || "");
    const desiredElementsRaw = formData.getAll("desiredElements").map(String);

    if (!photo) {
      return NextResponse.json({ error: "Falta la foto" }, { status: 400 });
    }
    if (!contactName || !contactPhone) {
      return NextResponse.json(
        { error: "Faltan datos de contacto" },
        { status: 400 }
      );
    }

    const arrayBuffer = await photo.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = photo.type || "image/jpeg";
    const photoDataUrl = `data:${mimeType};base64,${base64}`;

    const suggestedItems = DESIRED_ELEMENTS.filter((e) =>
      desiredElementsRaw.includes(e.value)
    ).map((e) => e.suggestion);

    const db = await getDb();
    const insertResult = await db.run(
      `INSERT INTO submissions
        (status, contact_name, contact_phone, contact_email, space_type, style, budget, desired_elements, comments, photo_data, suggested_items, payment_status, payment_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "pendiente",
        contactName,
        contactPhone,
        contactEmail,
        spaceType,
        style,
        budget,
        JSON.stringify(desiredElementsRaw),
        comments,
        photoDataUrl,
        JSON.stringify(suggestedItems),
        "pendiente",
        PROJECT_PRICE,
      ]
    );

    const submissionId = insertResult.lastInsertRowid;

    // Modo demo: sin Mercado Pago configurado, aprobamos el pago
    // automáticamente y generamos la imagen al toque, para poder probar
    // todo el flujo sin una cuenta real.
    if (!isMercadoPagoConfigured()) {
      const db2 = await getDb();
      await db2.run(
        `UPDATE submissions SET payment_status = 'pagado' WHERE id = ?`,
        [submissionId]
      );
      await runGenerationForSubmission(submissionId!);
      return NextResponse.json({
        id: submissionId,
        redirectUrl: `/solicitud/${submissionId}`,
        demoMode: true,
      });
    }

    const baseUrl = getAppBaseUrl(request);
    const preference = await createPreference({
      title: "Propuesta de diseño de espacio exterior (render con IA)",
      amount: PROJECT_PRICE,
      externalReference: `submission-${submissionId}`,
      backUrlSuccess: `${baseUrl}/solicitud/${submissionId}`,
      backUrlFailure: `${baseUrl}/solicitud/${submissionId}?pago=fallido`,
      backUrlPending: `${baseUrl}/solicitud/${submissionId}?pago=pendiente`,
      notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
    });

    await db.run(
      `UPDATE submissions SET mp_preference_id = ? WHERE id = ?`,
      [preference.id, submissionId]
    );

    return NextResponse.json({
      id: submissionId,
      redirectUrl: preference.initPoint,
      demoMode: false,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Error inesperado" },
      { status: 500 }
    );
  }
}

import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/auth";
import { getDb } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import SubmissionAdminPanel from "@/components/SubmissionAdminPanel";
import { SPACE_TYPES, STYLES, BUDGETS, DESIRED_ELEMENTS } from "@/lib/options";

function labelFor(list: { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label || value;
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");

  const { id } = await params;
  const db = await getDb();
  const submission = await db.get(`SELECT * FROM submissions WHERE id = ?`, [
    id,
  ]);
  if (!submission) return notFound();

  const quotes = await db.all(
    `SELECT * FROM quotes WHERE submission_id = ? ORDER BY created_at DESC`,
    [id]
  );
  const products = await db.all(
    `SELECT * FROM products WHERE active = 1 ORDER BY category, name`
  );

  const desiredElements: string[] = JSON.parse(
    submission.desired_elements || "[]"
  );

  return (
    <main className="flex-1">
      <AdminNav />
      <div className="px-6 max-w-4xl mx-auto pb-16">
        <h1 className="text-2xl font-bold mb-1">{submission.contact_name}</h1>
        <p className="text-foreground/60 mb-6">
          {submission.contact_phone} ·{" "}
          {submission.contact_email || "sin email"}
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm font-semibold mb-1">Foto original</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={submission.photo_data}
              alt="Foto original"
              className="rounded-xl w-full"
            />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Propuesta generada</p>
            {submission.generated_image_data ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={submission.generated_image_data}
                alt="Propuesta"
                className="rounded-xl w-full"
              />
            ) : (
              <div className="rounded-xl w-full h-full bg-brand-light flex items-center justify-center text-sm text-foreground/60 p-4">
                {submission.generated_image_error ||
                  "Todavía no se generó (pago pendiente)"}
              </div>
            )}
          </div>
        </div>

        <div className="bg-brand-light rounded-2xl p-5 mb-8 text-sm grid sm:grid-cols-2 gap-2">
          <p>
            <strong>Espacio:</strong> {labelFor(SPACE_TYPES, submission.space_type)}
          </p>
          <p>
            <strong>Estilo:</strong> {labelFor(STYLES, submission.style)}
          </p>
          <p>
            <strong>Presupuesto:</strong> {labelFor(BUDGETS, submission.budget)}
          </p>
          <p>
            <strong>Pago:</strong>{" "}
            {submission.payment_status === "pagado"
              ? `Pagado ($${submission.payment_amount})`
              : "Pendiente"}
          </p>
          <p className="sm:col-span-2">
            <strong>Elementos deseados:</strong>{" "}
            {desiredElements
              .map((v) => labelFor(DESIRED_ELEMENTS, v))
              .join(", ") || "—"}
          </p>
          {submission.comments && (
            <p className="sm:col-span-2">
              <strong>Comentarios:</strong> {submission.comments}
            </p>
          )}
        </div>

        <SubmissionAdminPanel
          submissionId={submission.id}
          currentStatus={submission.status}
          contactPhone={submission.contact_phone}
          products={products as any}
          existingQuotes={quotes as any}
        />
      </div>
    </main>
  );
}

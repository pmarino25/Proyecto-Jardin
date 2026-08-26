import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";

export default async function SolicitudPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const submission = await db.get(`SELECT * FROM submissions WHERE id = ?`, [
    id,
  ]);

  if (!submission) return notFound();

  const paid = submission.payment_status === "pagado";
  const ready = Boolean(submission.generated_image_data);
  const failed = Boolean(submission.generated_image_error);
  const stillWaiting = paid && !ready && !failed;

  const suggestedItems: string[] = JSON.parse(
    submission.suggested_items || "[]"
  );

  return (
    <main className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
      {!paid && (
        <>
          <AutoRefresh seconds={4} />
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-3">Confirmando tu pago…</h1>
            <p className="text-foreground/60">
              Esta página se actualiza sola. Si ya pagaste, en unos segundos
              vas a ver tu propuesta acá.
            </p>
          </div>
        </>
      )}

      {stillWaiting && (
        <>
          <AutoRefresh seconds={4} />
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-3">
              Generando tu propuesta…
            </h1>
            <p className="text-foreground/60">
              Puede tardar unos segundos. Esta página se actualiza sola.
            </p>
          </div>
        </>
      )}

      {failed && (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-3">
            Tuvimos un problema generando la imagen
          </h1>
          <p className="text-foreground/60 mb-4">
            Tu pago se registró correctamente. Nuestro equipo va a generar tu
            propuesta manualmente y te va a contactar en breve.
          </p>
        </div>
      )}

      {paid && ready && (
        <>
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Así podría quedar tu {submission.space_type}
          </h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={submission.generated_image_data}
            alt="Propuesta generada"
            className="rounded-2xl w-full mb-8"
          />

          {suggestedItems.length > 0 && (
            <div className="bg-brand-light rounded-2xl p-6 mb-8">
              <h2 className="font-semibold mb-3">
                Para hacerlo realidad, vas a necesitar:
              </h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                {suggestedItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center bg-white border rounded-2xl p-6">
            <p className="font-semibold mb-1">¿Querés hacerlo realidad?</p>
            <p className="text-sm text-foreground/60">
              En breve nuestro equipo te va a contactar por WhatsApp o email
              con una cotización a medida de productos y servicios. También
              podés escribirnos si tenés dudas.
            </p>
          </div>
        </>
      )}
    </main>
  );
}

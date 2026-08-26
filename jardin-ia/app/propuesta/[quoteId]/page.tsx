import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function PropuestaPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const { quoteId } = await params;
  const db = await getDb();

  const quote = await db.get(`SELECT * FROM quotes WHERE id = ?`, [quoteId]);
  if (!quote) return notFound();

  const items = await db.all(
    `SELECT * FROM quote_items WHERE quote_id = ? ORDER BY id`,
    [quoteId]
  );
  const submission = await db.get(
    `SELECT contact_name, space_type, style, generated_image_data FROM submissions WHERE id = ?`,
    [quote.submission_id]
  );

  const paid = quote.payment_status === "pagado";

  return (
    <main className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">
        Propuesta para {submission?.contact_name || "vos"}
      </h1>
      <p className="text-foreground/60 mb-8">
        {submission?.space_type} · {submission?.style}
      </p>

      {submission?.generated_image_data && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={submission.generated_image_data}
          alt="Propuesta"
          className="rounded-2xl w-full mb-8"
        />
      )}

      <div className="border rounded-2xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-brand-light">
            <tr>
              <th className="text-left px-4 py-2">Producto / servicio</th>
              <th className="text-right px-4 py-2">Cant.</th>
              <th className="text-right px-4 py-2">Precio</th>
              <th className="text-right px-4 py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={it.id} className="border-t">
                <td className="px-4 py-2">{it.description}</td>
                <td className="text-right px-4 py-2">{it.quantity}</td>
                <td className="text-right px-4 py-2">
                  ${it.unit_price.toLocaleString("es-AR")}
                </td>
                <td className="text-right px-4 py-2">
                  ${it.subtotal.toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold bg-brand-light">
              <td className="px-4 py-2" colSpan={3}>
                Total
              </td>
              <td className="text-right px-4 py-2">
                ${quote.total_amount.toLocaleString("es-AR")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {quote.notes && (
        <p className="text-sm text-foreground/70 mb-8">{quote.notes}</p>
      )}

      <div className="no-print text-center">
        {paid ? (
          <p className="text-green-700 font-semibold">
            ✅ Esta propuesta ya fue pagada. ¡Gracias!
          </p>
        ) : quote.payment_link ? (
          <a
            href={quote.payment_link}
            className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 text-lg transition-colors"
          >
            Pagar con Mercado Pago (hasta 12 cuotas)
          </a>
        ) : (
          <p className="text-foreground/60 text-sm">
            Todavía no hay un link de pago generado para esta propuesta.
          </p>
        )}
        <p className="mt-4">
          <button
            className="text-sm text-foreground/60 underline"
            data-print-trigger
          >
            Imprimir / guardar como PDF
          </button>
        </p>
      </div>
      <PrintButtonScript />
    </main>
  );
}

function PrintButtonScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('click', function (e) {
            if (e.target && e.target.closest('[data-print-trigger]')) {
              window.print();
            }
          });
        `,
      }}
    />
  );
}

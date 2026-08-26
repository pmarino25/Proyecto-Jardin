"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_LABELS } from "@/lib/options";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  active: number;
}

interface QuoteItemRow {
  productId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quote {
  id: number;
  total_amount: number;
  payment_status: string;
  payment_link: string | null;
  created_at: string;
}

export default function SubmissionAdminPanel({
  submissionId,
  currentStatus,
  contactPhone,
  products,
  existingQuotes,
}: {
  submissionId: number;
  currentStatus: string;
  contactPhone: string;
  products: Product[];
  existingQuotes: Quote[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [items, setItems] = useState<QuoteItemRow[]>([]);
  const [notes, setNotes] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>(existingQuotes);
  const [savingQuote, setSavingQuote] = useState(false);
  const [payLinkLoading, setPayLinkLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  function addProductItem(product: Product) {
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        description: product.name,
        quantity: 1,
        unitPrice: product.price,
      },
    ]);
  }

  function addCustomItem() {
    setItems((prev) => [
      ...prev,
      { productId: null, description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function updateItem(index: number, patch: Partial<QuoteItemRow>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateQuote() {
    setError(null);
    if (items.length === 0) {
      setError("Agregá al menos un producto o servicio");
      return;
    }
    setSavingQuote(true);
    try {
      const res = await fetch("/api/admin/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, notes, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la cotización");

      setQuotes((prev) => [
        {
          id: data.id,
          total_amount: data.totalAmount,
          payment_status: "pendiente",
          payment_link: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setItems([]);
      setNotes("");
      setStatus("cotizada");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingQuote(false);
    }
  }

  async function handleGenerateLink(quoteId: number) {
    setPayLinkLoading(quoteId);
    try {
      const res = await fetch(`/api/admin/quote/${quoteId}/pay-link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar el link");

      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, payment_link: data.link } : q))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPayLinkLoading(null);
    }
  }

  function whatsappLink(link: string) {
    const phone = contactPhone.replace(/\D/g, "");
    const text = encodeURIComponent(
      `¡Hola! Te paso el link de tu propuesta y cotización: ${link}`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }

  const categories = Array.from(new Set(products.map((p) => p.category || "Otros")));

  return (
    <div className="space-y-8">
      <div>
        <label className="font-semibold mr-3">Estado:</label>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-2xl p-5">
        <h2 className="font-semibold mb-4">Cotizaciones enviadas</h2>
        {quotes.length === 0 && (
          <p className="text-sm text-foreground/60">Todavía no armaste ninguna.</p>
        )}
        <div className="space-y-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between border rounded-lg p-3 text-sm"
            >
              <div>
                <p className="font-semibold">
                  ${q.total_amount.toLocaleString("es-AR")}
                </p>
                <p className="text-foreground/60">
                  {q.payment_status === "pagado" ? "Pagada ✅" : "Sin pagar"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {q.payment_link ? (
                  <a
                    href={whatsappLink(q.payment_link)}
                    target="_blank"
                    className="text-brand underline"
                  >
                    Enviar por WhatsApp
                  </a>
                ) : (
                  <button
                    onClick={() => handleGenerateLink(q.id)}
                    disabled={payLinkLoading === q.id}
                    className="rounded-full bg-brand text-white px-4 py-1.5 disabled:opacity-60"
                  >
                    {payLinkLoading === q.id ? "Generando…" : "Generar link de pago"}
                  </button>
                )}
                <a
                  href={`/propuesta/${q.id}`}
                  target="_blank"
                  className="text-foreground/60 underline"
                >
                  Ver propuesta
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-2xl p-5">
        <h2 className="font-semibold mb-4">Armar nueva cotización</h2>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Agregar del catálogo:</p>
          {categories.map((cat) => (
            <div key={cat} className="mb-2">
              <p className="text-xs uppercase text-foreground/50 mb-1">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {products
                  .filter((p) => (p.category || "Otros") === cat)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProductItem(p)}
                      className="text-sm border rounded-full px-3 py-1 hover:bg-brand-light"
                    >
                      + {p.name} (${p.price.toLocaleString("es-AR")})
                    </button>
                  ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCustomItem}
            className="text-sm text-brand underline mt-2"
          >
            + Agregar ítem personalizado
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="Descripción"
                className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, { quantity: Number(e.target.value) })
                }
                className="w-20 border rounded-lg px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(i, { unitPrice: Number(e.target.value) })
                }
                className="w-28 border rounded-lg px-2 py-1.5 text-sm"
              />
              <span className="w-24 text-sm text-right">
                ${(item.quantity * item.unitPrice).toLocaleString("es-AR")}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-red-600 text-sm"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas para el cliente (opcional)"
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
        />

        <div className="flex items-center justify-between">
          <p className="font-semibold">
            Total: ${total.toLocaleString("es-AR")}
          </p>
          <button
            type="button"
            onClick={handleCreateQuote}
            disabled={savingQuote}
            className="rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold px-6 py-2"
          >
            {savingQuote ? "Guardando…" : "Guardar cotización"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}

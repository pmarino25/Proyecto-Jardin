"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPACE_TYPES, STYLES, BUDGETS, DESIRED_ELEMENTS } from "@/lib/options";

export default function SolicitarForm({ price }: { price: number }) {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [desired, setDesired] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDesired(value: string) {
    setDesired((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      desired.forEach((d) => formData.append("desiredElements", d));

      const res = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error");
      }

      router.push(data.redirectUrl);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      <div className="bg-brand-light rounded-2xl p-5 text-sm">
        Costo de la propuesta: <strong>${price.toLocaleString("es-AR")}</strong>{" "}
        — vas a pagar en el siguiente paso con Mercado Pago (podés pagar en
        cuotas) y en minutos vas a tener tu render.
      </div>

      <div>
        <label className="block font-semibold mb-2">
          Foto de tu espacio <span className="text-accent">*</span>
        </label>
        <input
          type="file"
          name="photo"
          accept="image/*"
          required
          onChange={handlePhotoChange}
          className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-brand file:text-white file:px-4 file:py-2 file:font-semibold"
        />
        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoPreview}
            alt="Vista previa"
            className="mt-4 rounded-xl max-h-64 object-cover"
          />
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold mb-2">Tipo de espacio</label>
          <select
            name="spaceType"
            required
            className="w-full border rounded-lg px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Elegí una opción
            </option>
            {SPACE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-2">Estilo</label>
          <select
            name="style"
            required
            className="w-full border rounded-lg px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Elegí una opción
            </option>
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-2">Presupuesto aprox.</label>
          <select
            name="budget"
            required
            className="w-full border rounded-lg px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Elegí una opción
            </option>
            {BUDGETS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-2">
          ¿Qué te gustaría incorporar?
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          {DESIRED_ELEMENTS.map((el) => (
            <label
              key={el.value}
              className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={desired.includes(el.value)}
                onChange={() => toggleDesired(el.value)}
              />
              {el.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-2">
          Comentarios adicionales (opcional)
        </label>
        <textarea
          name="comments"
          rows={3}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Contanos cualquier detalle extra que te parezca útil"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold mb-2">
            Nombre <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            name="contactName"
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">
            Teléfono / WhatsApp <span className="text-accent">*</span>
          </label>
          <input
            type="tel"
            name="contactPhone"
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Email (opcional)</label>
          <input
            type="email"
            name="contactEmail"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold px-8 py-4 text-lg transition-colors"
      >
        {loading ? "Procesando..." : `Continuar y pagar $${price.toLocaleString("es-AR")}`}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  active: number;
}

const emptyForm = { name: "", description: "", category: "", price: "", unit: "unidad" };

export default function CatalogManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/catalog");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || form.price === "") {
      setError("Nombre y precio son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }
      setForm(emptyForm);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Dar de baja este producto/servicio?")) return;
    await fetch(`/api/admin/catalog/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleUpdatePrice(product: Product, price: number) {
    await fetch(`/api/admin/catalog/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, price }),
    });
    await load();
  }

  const categories = Array.from(
    new Set(products.map((p) => p.category || "Otros"))
  );

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16">
      <h1 className="text-2xl font-bold mb-6">Catálogo de productos y servicios</h1>

      <form
        onSubmit={handleAdd}
        className="border rounded-2xl p-5 mb-8 grid sm:grid-cols-5 gap-2 items-end"
      >
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1">Nombre</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Categoría</label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Vivero, muebles..."
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Precio</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Unidad</label>
          <input
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-5">
          <label className="block text-xs font-medium mb-1">Descripción</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        {error && <p className="text-red-600 text-sm sm:col-span-5">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-5 rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold px-6 py-2"
        >
          {saving ? "Guardando…" : "Agregar al catálogo"}
        </button>
      </form>

      {loading ? (
        <p className="text-foreground/60">Cargando…</p>
      ) : (
        categories.map((cat) => (
          <div key={cat} className="mb-6">
            <h2 className="font-semibold mb-2">{cat}</h2>
            <div className="space-y-2">
              {products
                .filter((p) => (p.category || "Otros") === cat)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 border rounded-lg p-3 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-foreground/60">{p.description}</p>
                    </div>
                    <input
                      type="number"
                      defaultValue={p.price}
                      onBlur={(e) =>
                        handleUpdatePrice(p, Number(e.target.value))
                      }
                      className="w-28 border rounded-lg px-2 py-1 text-right"
                    />
                    <span className="text-foreground/50 text-xs w-16">
                      / {p.unit}
                    </span>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

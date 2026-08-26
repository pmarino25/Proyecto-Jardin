import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminLoggedIn } from "@/lib/auth";
import { getDb } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import { STATUS_LABELS } from "@/lib/options";

export default async function AdminDashboard() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");

  const db = await getDb();
  const submissions = await db.all(
    `SELECT id, created_at, status, contact_name, contact_phone, space_type, style, payment_status, generated_image_data, generated_image_error
     FROM submissions ORDER BY created_at DESC`
  );

  return (
    <main className="flex-1">
      <AdminNav />
      <div className="px-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Solicitudes</h1>

        {submissions.length === 0 && (
          <p className="text-foreground/60">Todavía no hay solicitudes.</p>
        )}

        <div className="space-y-3">
          {submissions.map((s: any) => (
            <Link
              key={s.id}
              href={`/admin/solicitudes/${s.id}`}
              className="flex items-center gap-4 border rounded-xl p-4 hover:bg-brand-light transition-colors"
            >
              {s.generated_image_data ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.generated_image_data}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-brand-light flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {s.contact_name || "Sin nombre"} · {s.space_type}
                </p>
                <p className="text-sm text-foreground/60">
                  {s.contact_phone} ·{" "}
                  {new Date(s.created_at).toLocaleString("es-AR")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
                <span className="rounded-full bg-brand-light px-3 py-1 font-medium">
                  {STATUS_LABELS[s.status] || s.status}
                </span>
                <span
                  className={
                    s.payment_status === "pagado"
                      ? "text-green-700"
                      : "text-accent"
                  }
                >
                  {s.payment_status === "pagado" ? "Pagado" : "Pago pendiente"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

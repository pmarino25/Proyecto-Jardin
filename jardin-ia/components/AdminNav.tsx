"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${
      pathname === href
        ? "bg-brand text-white"
        : "text-foreground/70 hover:bg-brand-light"
    }`;

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b mb-6">
      <div className="flex items-center gap-2">
        <Link href="/admin" className={linkClass("/admin")}>
          Solicitudes
        </Link>
        <Link href="/admin/catalogo" className={linkClass("/admin/catalogo")}>
          Catálogo
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-foreground/60 hover:text-foreground"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}

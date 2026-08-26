import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import CatalogManager from "@/components/CatalogManager";

export default async function CatalogoPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");

  return (
    <main className="flex-1">
      <AdminNav />
      <CatalogManager />
    </main>
  );
}

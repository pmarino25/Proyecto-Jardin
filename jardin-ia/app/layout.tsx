import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Renová tu jardín con IA",
  description:
    "Subí una foto de tu espacio exterior y recibí una propuesta de diseño generada con IA, más una cotización de productos y servicios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

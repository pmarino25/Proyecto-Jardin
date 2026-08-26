import SolicitarForm from "@/components/SolicitarForm";

export default function SolicitarPage() {
  const price = Number(process.env.PROJECT_PRICE || 10000);

  return (
    <main className="flex-1 px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
        Contanos sobre tu espacio
      </h1>
      <p className="text-center text-foreground/60 mb-10">
        Con esto vamos a generar tu propuesta.
      </p>
      <SolicitarForm price={price} />
    </main>
  );
}

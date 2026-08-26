import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center">
        <p className="text-brand font-semibold tracking-wide uppercase text-sm mb-3">
          Diseño de espacios exteriores con IA
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
          Mirá cómo puede quedar tu jardín, patio o terraza
        </h1>
        <p className="text-lg text-foreground/70 mb-10">
          Subí una foto de tu espacio, contanos qué estilo buscás y en
          minutos recibís una imagen de cómo podría quedar renovado, junto
          con los productos y servicios que necesitás para hacerlo realidad.
        </p>
        <Link
          href="/solicitar"
          className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 text-lg transition-colors"
        >
          Quiero mi propuesta
        </Link>

        <div className="grid sm:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-brand-light rounded-2xl p-6">
            <div className="text-2xl mb-2">1. Subí una foto</div>
            <p className="text-foreground/70 text-sm">
              De tu jardín, patio, terraza, balcón o quincho, y contanos qué
              te gustaría cambiar.
            </p>
          </div>
          <div className="bg-brand-light rounded-2xl p-6">
            <div className="text-2xl mb-2">2. Recibí tu render</div>
            <p className="text-foreground/70 text-sm">
              Una imagen generada con IA que muestra una propuesta realista
              para tu espacio.
            </p>
          </div>
          <div className="bg-brand-light rounded-2xl p-6">
            <div className="text-2xl mb-2">3. Pedí tu cotización</div>
            <p className="text-foreground/70 text-sm">
              Te armamos una propuesta con los productos y servicios que
              necesitás, y te la conseguimos nosotros.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

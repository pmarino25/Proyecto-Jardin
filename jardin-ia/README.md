# Jardín IA

Plataforma para pedir una propuesta de diseño (render con IA) de un jardín,
patio, terraza o balcón, y luego recibir una cotización de productos y
servicios reales que el equipo arma y vende directamente.

## Cómo funciona

1. El cliente entra a la web, sube una foto de su espacio y responde un
   cuestionario corto (tipo de espacio, estilo, presupuesto, qué quiere
   incorporar).
2. Paga la propuesta con Mercado Pago (o queda aprobado automáticamente en
   modo demo, ver abajo).
3. El sistema genera una imagen editada con IA (Google Gemini) mostrando una
   propuesta del espacio renovado, junto con una lista de categorías de
   productos/servicios sugeridos.
4. El equipo (admin) ve la solicitud en el panel, arma una cotización real
   con precios de su catálogo, y genera un link de pago para esa cotización.
5. El cliente paga la cotización con Mercado Pago (con cuotas) y queda
   marcada como vendida.

## Stack técnico

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Base de datos**: SQLite en desarrollo (sin configuración necesaria) /
  Postgres en producción (cambia solo con la variable `DATABASE_URL`)
- **IA de imágenes**: Google Gemini (`gemini-3.1-flash-image` o el modelo
  configurado en `GEMINI_IMAGE_MODEL`)
- **Pagos**: Mercado Pago Checkout Pro (vía API REST directa, sin SDK)
- Sin dependencias de infraestructura pesada: pensado para desplegar fácil
  en Vercel + una base Postgres gratuita (Neon/Supabase)

## Modo demo (sin configurar nada)

Si no configurás `GEMINI_API_KEY` ni `MP_ACCESS_TOKEN`, la app funciona
igual, pero:

- Los pagos se aprueban automáticamente (sin pasar por Mercado Pago real)
- La "imagen generada" es la misma foto original (sin editar con IA)

Esto sirve para probar todo el flujo (cliente + panel admin) sin gastar
nada ni tener las cuentas armadas todavía.

## Desarrollo local

Requiere Node.js 22.5 o superior (usa el módulo nativo `node:sqlite`).

```bash
npm install
npm run dev
```

Abrí http://localhost:3000 para la web del cliente, y
http://localhost:3000/admin para el panel (contraseña por defecto:
`admin123`, configurable con `ADMIN_PASSWORD`).

## Variables de entorno

Ver `.env.example` para la lista completa con explicación de cada una.
Copiala a `.env.local` para desarrollo.

## Desplegar a producción

Ver [`DEPLOY.md`](./DEPLOY.md) para la guía paso a paso (sin necesitar
saber programar).

## Estructura del proyecto

```
app/                   Páginas y rutas de API (Next.js App Router)
  admin/                Panel de administración
  solicitar/            Formulario del cliente
  solicitud/[id]/       Resultado (imagen generada) para el cliente
  propuesta/[quoteId]/  Cotización pública (con botón de pago)
  api/                  Endpoints backend
lib/                    Lógica compartida (db, IA, Mercado Pago, auth)
components/             Componentes de React reutilizables
```

## Extender la app

El código está organizado para que sea fácil sumar funcionalidades después:
notificaciones automáticas por WhatsApp/email, cuentas de cliente, más
medios de pago, reportes de ventas, etc. Cualquier desarrollador Next.js
puede seguir trabajando sobre esta base.

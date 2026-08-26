# Guía para publicar la app (paso a paso)

Esta guía asume que no programás. Son todo clicks en páginas web. Te va a
llevar entre 15 y 30 minutos la primera vez.

## Resumen de lo que vas a necesitar

1. Una cuenta de **GitHub** (gratis) — donde va a vivir el código
2. Una cuenta de **Vercel** (gratis) — donde va a correr la web
3. Una base de datos **Neon** o **Supabase** (gratis) — donde se guardan las
   solicitudes, el catálogo y las cotizaciones
4. Una **API key de Google AI Studio** (gratis, con límites) — para generar
   las imágenes con IA
5. Una cuenta de **Mercado Pago** con **Access Token** — para cobrar

Podés publicar la app primero sin Mercado Pago ni Gemini (queda en "modo
demo") y agregarlos después sin volver a hacer nada de esto: solo agregás
la variable de entorno correspondiente en Vercel.

---

## Paso 1 — Subir el código a GitHub

1. Entrá a [github.com](https://github.com) y creá una cuenta si no tenés.
2. Creá un repositorio nuevo (botón verde "New").
3. Subí el contenido de esta carpeta. La forma más simple: en la página del
   repositorio recién creado, usá "uploading an existing file" y arrastrá
   todos los archivos y carpetas (menos `node_modules` y `.next`, si
   existieran, no hace falta subirlos).

Si en algún momento querés que un desarrollador te ayude a hacerlo con
`git` por línea de comandos, cualquiera puede tomarlo desde acá sin
problema.

## Paso 2 — Crear la base de datos (Neon)

1. Entrá a [neon.tech](https://neon.tech) y creá una cuenta gratis.
2. Creá un proyecto nuevo.
3. Copiá el **Connection String** (empieza con `postgres://...`). Vas a
   necesitarlo en el Paso 5.

(Supabase es una alternativa igual de válida, el connection string se
consigue de forma parecida.)

## Paso 3 — Conseguir la API key de Gemini (generación de imágenes)

1. Entrá a [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   con tu cuenta de Google.
2. Creá una API key nueva y copiala.
3. Google puede cambiar de tanto en tanto el nombre exacto del modelo de
   generación de imágenes más nuevo. Al momento de armar esta app, el
   recomendado es `gemini-3.1-flash-image`. Si en el futuro ves errores de
   "modelo no encontrado", revisá el nombre actual en
   [ai.google.dev/gemini-api/docs/image-generation](https://ai.google.dev/gemini-api/docs/image-generation)
   y actualizá la variable `GEMINI_IMAGE_MODEL` en Vercel.

## Paso 4 — Conseguir el Access Token de Mercado Pago

1. Entrá a
   [mercadopago.com.ar/developers/panel/app](https://www.mercadopago.com.ar/developers/panel/app)
   con tu cuenta de Mercado Pago (tiene que ser una cuenta vendedor/negocio).
2. Creá una aplicación.
3. **Para probar primero sin riesgo**: usá las credenciales de **prueba**
   (empiezan con `TEST-`). Con esas, todos los pagos funcionan en un entorno
   de simulación, no se mueve plata real.
4. Cuando ya probaste todo el flujo y estás conforme, cambiá a las
   credenciales de **producción** (Access Token real, sin `TEST-`) para
   empezar a cobrar de verdad.

No hace falta configurar nada más manualmente del lado de Mercado Pago: la
app le avisa automáticamente a Mercado Pago dónde notificar los pagos
(usando la variable `APP_BASE_URL` que configurás en el paso 5).

## Paso 5 — Publicar en Vercel

1. Entrá a [vercel.com](https://vercel.com) y creá una cuenta (podés
   entrar directo con tu cuenta de GitHub).
2. "Add New" → "Project" → elegí el repositorio que subiste en el Paso 1.
3. Antes de darle a "Deploy", abrí la sección **Environment Variables** y
   cargá estas (los nombres exactos, uno por uno):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | El connection string de Neon del Paso 2 |
   | `GEMINI_API_KEY` | La API key del Paso 3 |
   | `GEMINI_IMAGE_MODEL` | `gemini-3.1-flash-image` |
   | `MP_ACCESS_TOKEN` | El Access Token del Paso 4 (empezá con el de `TEST-`) |
   | `PROJECT_PRICE` | `10000` (o el precio que quieras cobrar por la propuesta) |
   | `ADMIN_PASSWORD` | Una contraseña fuerte que vos elijas para entrar a `/admin` |
   | `SESSION_SECRET` | Cualquier texto largo y random, por ejemplo 40 caracteres al azar |
   | `APP_BASE_URL` | La dejás vacía por ahora, la completás en el Paso 6 |

4. Dale a **Deploy** y esperá unos minutos.

## Paso 6 — Completar la URL pública

1. Cuando termine el deploy, Vercel te va a dar una URL, algo como
   `https://jardin-ia-tuusuario.vercel.app`.
2. Volvé a **Settings → Environment Variables**, editá `APP_BASE_URL` y
   poné esa URL completa (sin `/` al final).
3. Volvé a desplegar (Vercel → pestaña "Deployments" → "..." → "Redeploy")
   para que tome el cambio.

Si más adelante conectás un dominio propio (tipo `www.tunegocio.com`),
actualizá `APP_BASE_URL` con ese dominio y volvé a hacer redeploy.

## Paso 7 — Probar todo antes de compartir el link

1. Entrá a tu URL, hacé una solicitud de prueba con una foto cualquiera.
2. Si usaste el Access Token de `TEST-` de Mercado Pago, vas a poder pagar
   con [tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)
   sin gastar plata real.
3. Entrá a `/admin` con la contraseña que configuraste, cargá algunos
   productos/servicios de tu catálogo real, y armá una cotización de
   prueba para esa solicitud.
4. Generá el link de pago de la cotización y probá pagarlo también.
5. Cuando todo funcione bien, cambiá `MP_ACCESS_TOKEN` en Vercel al Access
   Token de **producción** (sin `TEST-`) y volvé a hacer redeploy. A partir
   de ahí los pagos son reales.

## Listo

A partir de acá, la URL de Vercel es la que le podés pasar a Matías y a
sus clientes. El panel de administración vive en `/admin` de esa misma URL.

### Si más adelante querés agregar funcionalidades

El código quedó organizado en carpetas claras (`app/`, `lib/`,
`components/`, ver el `README.md`). Cualquier desarrollador que sepa
Next.js puede tomarlo desde acá y seguir sumando cosas: notificaciones
automáticas, cuentas de cliente, reportes, etc.

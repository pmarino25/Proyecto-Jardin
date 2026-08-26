// Integración con Mercado Pago usando la API REST directamente (Checkout Pro),
// sin el SDK de npm, para no depender de una versión específica del paquete.
// Doc oficial: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing
//
// Si MP_ACCESS_TOKEN no está configurada, el sistema funciona en "modo demo":
// los pagos se marcan como aprobados automáticamente sin pasar por Mercado
// Pago, para poder probar el flujo completo sin una cuenta real.

const MP_API_BASE = "https://api.mercadopago.com";

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

export interface CreatePreferenceParams {
  title: string;
  amount: number; // en la moneda configurada (ARS)
  externalReference: string;
  backUrlSuccess: string;
  backUrlFailure: string;
  backUrlPending: string;
  notificationUrl: string;
}

export interface PreferenceResult {
  id: string;
  initPoint: string;
}

export async function createPreference(
  params: CreatePreferenceParams
): Promise<PreferenceResult> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN no configurada");
  }

  const isTestToken = accessToken.startsWith("TEST-");

  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: params.title,
          quantity: 1,
          unit_price: params.amount,
          currency_id: "ARS",
        },
      ],
      external_reference: params.externalReference,
      back_urls: {
        success: params.backUrlSuccess,
        failure: params.backUrlFailure,
        pending: params.backUrlPending,
      },
      auto_return: "approved",
      notification_url: params.notificationUrl,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error creando preferencia de Mercado Pago: ${res.status} ${text}`);
  }

  const json: any = await res.json();

  return {
    id: json.id,
    initPoint: isTestToken ? json.sandbox_init_point : json.init_point,
  };
}

export interface PaymentInfo {
  id: string;
  status: string; // 'approved', 'pending', 'rejected', etc.
  externalReference: string | null;
}

export async function getPayment(paymentId: string): Promise<PaymentInfo> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN no configurada");
  }

  const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error consultando pago en Mercado Pago: ${res.status} ${text}`);
  }

  const json: any = await res.json();
  return {
    id: String(json.id),
    status: json.status,
    externalReference: json.external_reference ?? null,
  };
}

// URL base pública de la app, necesaria para construir back_urls y
// notification_url que Mercado Pago pueda alcanzar desde internet.
export function getAppBaseUrl(request: Request): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

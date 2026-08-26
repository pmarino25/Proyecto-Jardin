// Integración con la API de Gemini (Google) para generar/editar la imagen
// del espacio a partir de la foto subida por el cliente.
//
// Modelo recomendado al momento de escribir esto: "gemini-3.1-flash-image"
// (conocido como "Nano Banana"). Si Google cambia el nombre del modelo o el
// endpoint, actualizar las constantes de abajo y revisar la doc oficial:
// https://ai.google.dev/gemini-api/docs/image-generation
//
// Si no hay GEMINI_API_KEY configurada, esta función funciona en "modo demo":
// devuelve la misma foto original sin modificar, marcada como mock, para que
// todo el flujo se pueda probar sin gastar en API real.

const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

export interface GenerateImageResult {
  success: boolean;
  mock: boolean;
  imageDataUrl?: string; // data:image/...;base64,...
  error?: string;
}

export async function generateSpaceImage(
  originalPhotoDataUrl: string,
  prompt: string
): Promise<GenerateImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: true,
      mock: true,
      imageDataUrl: originalPhotoDataUrl,
    };
  }

  const match = originalPhotoDataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return { success: false, mock: false, error: "Formato de imagen inválido" };
  }
  const mimeType = match[1];
  const base64Data = match[2];

  try {
    const res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: [
          { type: "text", text: prompt },
          { type: "image", mime_type: mimeType, data: base64Data },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        mock: false,
        error: `Gemini API error ${res.status}: ${text.slice(0, 300)}`,
      };
    }

    const json: any = await res.json();

    // Forma esperada según la doc: json.output_image.data (base64) +
    // json.output_image.mime_type. Si la API cambia de forma, probamos
    // rutas alternativas antes de fallar.
    const outImg = json.output_image;
    if (outImg?.data) {
      const outMime = outImg.mime_type || "image/png";
      return {
        success: true,
        mock: false,
        imageDataUrl: `data:${outMime};base64,${outImg.data}`,
      };
    }

    // Ruta alternativa: steps -> model_output -> content -> [{type:'image', ...}]
    const steps = json.steps;
    if (Array.isArray(steps)) {
      for (const step of steps) {
        const content = step?.model_output?.content;
        if (Array.isArray(content)) {
          const imagePart = content.find((c: any) => c.type === "image" && c.data);
          if (imagePart) {
            const outMime = imagePart.mime_type || "image/png";
            return {
              success: true,
              mock: false,
              imageDataUrl: `data:${outMime};base64,${imagePart.data}`,
            };
          }
        }
      }
    }

    return {
      success: false,
      mock: false,
      error: "No se encontró imagen en la respuesta de la API. Revisar formato actual en la documentación de Gemini.",
    };
  } catch (err: any) {
    return { success: false, mock: false, error: err?.message || "Error desconocido" };
  }
}

export function buildPrompt(opts: {
  spaceType: string;
  style: string;
  desiredElements: string[];
  comments: string;
}): string {
  const { spaceType, style, desiredElements, comments } = opts;
  const elementos =
    desiredElements.length > 0
      ? `Incorporá especialmente: ${desiredElements.join(", ")}.`
      : "";
  return [
    `Editá esta foto de un ${spaceType} para mostrar una propuesta de renovación realista.`,
    `Estilo deseado: ${style}.`,
    elementos,
    comments ? `Comentarios adicionales del cliente: ${comments}.` : "",
    "Mantené la estructura y perspectiva original del espacio (paredes, límites, construcciones fijas).",
    "El resultado debe verse como una foto realista de cómo quedaría el espacio renovado, no como un dibujo o boceto.",
  ]
    .filter(Boolean)
    .join(" ");
}

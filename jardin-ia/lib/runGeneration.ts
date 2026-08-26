import { getDb } from "@/lib/db";
import { buildPrompt, generateSpaceImage } from "@/lib/imageGen";
import { DESIRED_ELEMENTS } from "@/lib/options";

// Corre la generación de imagen con IA para una solicitud ya pagada, y
// actualiza la fila en la base de datos con el resultado.
export async function runGenerationForSubmission(submissionId: number | bigint) {
  const db = await getDb();
  const submission = await db.get(`SELECT * FROM submissions WHERE id = ?`, [
    submissionId,
  ]);
  if (!submission) return;

  // Evitar generar dos veces si el webhook llega más de una vez.
  if (submission.generated_image_data) return;

  const desiredElementsRaw: string[] = JSON.parse(
    submission.desired_elements || "[]"
  );
  const desiredLabels = DESIRED_ELEMENTS.filter((e) =>
    desiredElementsRaw.includes(e.value)
  ).map((e) => e.label);

  const prompt = buildPrompt({
    spaceType: submission.space_type,
    style: submission.style,
    desiredElements: desiredLabels,
    comments: submission.comments || "",
  });

  const genResult = await generateSpaceImage(submission.photo_data, prompt);

  await db.run(
    `UPDATE submissions SET generated_image_data = ?, generated_image_error = ? WHERE id = ?`,
    [
      genResult.success ? genResult.imageDataUrl || null : null,
      genResult.success ? null : genResult.error || "Error al generar imagen",
      submissionId,
    ]
  );
}

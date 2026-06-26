import { addEvidenceMetadata } from "@/lib/server/bonds";
import { serializeEvidenceFile } from "@/lib/presenters";
import { evidenceMetadataSchema } from "@/lib/server/validators";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = evidenceMetadataSchema.parse(await request.json());
    const evidence = await addEvidenceMetadata(id, body);

    return Response.json({
      evidence: serializeEvidenceFile(evidence),
    });
  } catch (error) {
    return jsonError(error);
  }
}

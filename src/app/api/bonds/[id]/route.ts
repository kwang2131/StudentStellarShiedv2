import { getBondCaseById } from "@/lib/server/bonds";
import {
  serializeAuditLog,
  serializeBondCase,
  serializeEvidenceFile,
  serializeWalletInteraction,
} from "@/lib/presenters";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const bondCase = await getBondCaseById(id);

    if (!bondCase) {
      return Response.json({ error: "StudyBond case not found." }, { status: 404 });
    }

    return Response.json({
      bondCase: serializeBondCase(bondCase),
      auditLogs: bondCase.auditLogs.map(serializeAuditLog),
      evidenceFiles: bondCase.evidenceFiles.map(serializeEvidenceFile),
      walletInteractions: bondCase.walletInteractions.map(serializeWalletInteraction),
    });
  } catch (error) {
    return jsonError(error);
  }
}

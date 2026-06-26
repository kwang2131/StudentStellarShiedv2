import { getWalletProofPageData } from "@/lib/server/wallet-proofs";
import { serializeWalletInteraction } from "@/lib/presenters";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getWalletProofPageData();

    return Response.json({
      interactions: data.interactions.map(serializeWalletInteraction),
      summary: data.summary,
    });
  } catch (error) {
    return jsonError(error);
  }
}

import { getTestWalletPageData } from "@/lib/server/test-wallets";
import { serializeTestWallet } from "@/lib/presenters";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const wallets = await getTestWalletPageData();
    return Response.json({
      wallets: wallets.map(serializeTestWallet),
    });
  } catch (error) {
    return jsonError(error);
  }
}

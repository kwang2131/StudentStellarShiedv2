import { PageIntro } from "@/components/page-intro";
import { WalletProofTable } from "@/components/wallet-proof-table";
import { getWalletProofPageData } from "@/lib/server/wallet-proofs";
import { serializeWalletInteraction } from "@/lib/presenters";

export const dynamic = "force-dynamic";

export default async function WalletProofsPage() {
  const data = await getWalletProofPageData();

  return (
    <div className="space-y-6">
      <PageIntro
        description="Reviewer-facing evidence for successful and failed wallet interactions, including provider, tx hash, role, and timestamp."
        eyebrow="Proofs"
        title="Wallet interaction proof ledger"
      />
      <WalletProofTable
        interactions={data.interactions.map(serializeWalletInteraction)}
        summary={data.summary}
      />
    </div>
  );
}

import { PageIntro } from "@/components/page-intro";
import { TestWalletTable } from "@/components/test-wallet-table";
import { getTestWalletPageData } from "@/lib/server/test-wallets";
import { serializeTestWallet } from "@/lib/presenters";

export const dynamic = "force-dynamic";

export default async function TestWalletsPage() {
  const wallets = await getTestWalletPageData();

  return (
    <div className="space-y-6">
      <PageIntro
        description="Operational view of generated testnet wallets, suggested roles, balances, and whether each identity has been used in StudyBond validation."
        eyebrow="Test wallets"
        title="Twelve Stellar testnet identities"
      />
      <TestWalletTable wallets={wallets.map(serializeTestWallet)} />
    </div>
  );
}

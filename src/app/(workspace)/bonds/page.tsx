import Link from "next/link";

import { BondsListClient } from "@/components/bonds-list-client";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { listBondCases } from "@/lib/server/bonds";
import { serializeBondCase } from "@/lib/presenters";

export const dynamic = "force-dynamic";

export default async function BondsPage() {
  const cases = await listBondCases();
  const serialized = cases.map(serializeBondCase);

  return (
    <div className="space-y-6">
      <PageIntro
        actions={
          <Link href="/bonds/new">
            <Button>Create StudyBond</Button>
          </Link>
        }
        description="Search and filter across tuition, dorm, rental, and visa proof cases with full status visibility."
        eyebrow="Cases"
        title="All StudyBond cases"
      />
      <BondsListClient
        cases={serialized.map((item) => ({
          amount: item.amount,
          assetCode: item.assetCode,
          caseType: item.caseType,
          createdAt: item.createdAt,
          fundTxHash: item.fundTxHash,
          id: item.id,
          status: item.status,
          studentName: item.studentName,
          studentWalletAddress: item.studentWalletAddress,
          targetCountry: item.targetCountry,
          verifierName: item.verifierName,
        }))}
      />
    </div>
  );
}

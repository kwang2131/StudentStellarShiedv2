import { notFound } from "next/navigation";

import { AuditTimeline } from "@/components/audit-timeline";
import { VerifyProofCard } from "@/components/verify-proof-card";
import { getVerifyCaseById } from "@/lib/server/bonds";
import { serializeAuditLog } from "@/lib/presenters";

export const dynamic = "force-dynamic";

export default async function VerifyCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const bondCase = await getVerifyCaseById(caseId);

  if (!bondCase) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <VerifyProofCard
          amount={bondCase.amount}
          assetCode={bondCase.assetCode}
          auditCount={bondCase.auditLogs.length}
          contractAddress={bondCase.contractAddress}
          expiryDate={bondCase.expiryDate.toISOString()}
          fundTxHash={bondCase.fundTxHash}
          lastContractState={
            bondCase.lastContractState && typeof bondCase.lastContractState === "object"
              ? (bondCase.lastContractState as Record<string, unknown>)
              : null
          }
          onchainCaseId={bondCase.onchainCaseId}
          status={bondCase.status}
          studentWalletAddress={bondCase.studentWalletAddress}
          verifierName={bondCase.verifierName}
        />

        <section className="surface-panel rounded-[1.75rem] p-5">
          <h2 className="text-2xl font-semibold">Public-safe audit trail</h2>
          <div className="mt-5">
            <AuditTimeline logs={bondCase.auditLogs.map(serializeAuditLog)} />
          </div>
        </section>
      </div>
    </div>
  );
}

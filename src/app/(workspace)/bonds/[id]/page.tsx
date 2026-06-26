import { notFound } from "next/navigation";

import { AuditTimeline } from "@/components/audit-timeline";
import { BondDetailHeader } from "@/components/bond-detail-header";
import { DisputeResolutionPanel } from "@/components/dispute-resolution-panel";
import { EmptyState } from "@/components/empty-state";
import { EvidenceList } from "@/components/evidence-list";
import { EvidenceUploadCard } from "@/components/evidence-upload-card";
import { FundingActionPanel } from "@/components/funding-action-panel";
import { PageIntro } from "@/components/page-intro";
import { WalletProofTable } from "@/components/wallet-proof-table";
import { getBondCaseById } from "@/lib/server/bonds";
import {
  serializeAuditLog,
  serializeBondCase,
  serializeEvidenceFile,
  serializeWalletInteraction,
} from "@/lib/presenters";
import { stellarConfig } from "@/lib/stellar/config";

export const dynamic = "force-dynamic";

export default async function BondDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bondCase = await getBondCaseById(id);

  if (!bondCase) {
    notFound();
  }

  const serialized = serializeBondCase(bondCase);
  const auditLogs = bondCase.auditLogs.map(serializeAuditLog);
  const evidence = bondCase.evidenceFiles.map(serializeEvidenceFile);
  const interactions = bondCase.walletInteractions.map(serializeWalletInteraction);
  const summary = {
    failed: interactions.filter((item) => !item.success).length,
    successful: interactions.filter((item) => item.success).length,
    total: interactions.length,
    uniqueWallets: new Set(interactions.map((item) => item.walletAddress)).size,
  };

  return (
    <div className="space-y-6">
      <PageIntro
        description="Review lifecycle status, funding proof, evidence metadata, and role-based actions for this individual StudyBond case."
        eyebrow="Case detail"
        title={`StudyBond ${serialized.id}`}
      />

      <BondDetailHeader
        amount={serialized.amount}
        assetCode={serialized.assetCode}
        caseType={serialized.caseType}
        contractAddress={serialized.contractAddress}
        expiryDate={serialized.expiryDate}
        fundTxHash={serialized.fundTxHash}
        initializeTxHash={serialized.initializeTxHash}
        payerWalletAddress={serialized.payerWalletAddress}
        status={serialized.status}
        studentName={serialized.studentName}
        studentWalletAddress={serialized.studentWalletAddress}
        verifierName={serialized.verifierName}
        verifierWalletAddress={serialized.verifierWalletAddress}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <FundingActionPanel
            amount={serialized.amount}
            caseId={serialized.id}
            hasContract={Boolean(stellarConfig.contractId)}
            status={serialized.status}
          />

          <DisputeResolutionPanel
            amount={serialized.amount}
            caseId={serialized.id}
            disabled={serialized.status !== "DISPUTED" && serialized.status !== "EXPIRED"}
          />

          <section className="surface-panel rounded-[1.75rem] p-5">
            <h2 className="text-2xl font-semibold">Conditions</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Release condition</p>
                <p className="mt-2 text-sm leading-7 text-foreground">{serialized.releaseCondition}</p>
              </div>
              <div className="rounded-[1.5rem] bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Refund condition</p>
                <p className="mt-2 text-sm leading-7 text-foreground">{serialized.refundCondition}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <EvidenceUploadCard caseId={serialized.id} />
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Evidence list</h2>
            {evidence.length === 0 ? (
              <EmptyState
                description="No evidence metadata is attached to this case yet."
                title="No evidence yet"
              />
            ) : (
              <EvidenceList evidence={evidence} />
            )}
          </section>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Wallet interaction proof</h2>
        {interactions.length === 0 ? (
          <EmptyState
            description="Connect a wallet and submit a contract action to start collecting proof rows for this case."
            title="No wallet interactions yet"
          />
        ) : (
          <WalletProofTable interactions={interactions} summary={summary} />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Audit timeline</h2>
        {auditLogs.length === 0 ? (
          <EmptyState
            description="No audit events recorded yet."
            title="No audit trail yet"
          />
        ) : (
          <AuditTimeline logs={auditLogs} />
        )}
      </section>
    </div>
  );
}

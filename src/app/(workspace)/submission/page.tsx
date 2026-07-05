import { ContractIntegrationPanel } from "@/components/contract-integration-panel";
import { PageIntro } from "@/components/page-intro";
import { SubmissionChecklist } from "@/components/submission-checklist";
import { TransactionHashLink } from "@/components/transaction-hash-link";
import { WalletConnectFeature } from "@/components/wallet-connect-feature";
import { getSubmissionPageData } from "@/lib/server/submission";
import { addressExplorerUrl, contractExplorerUrl } from "@/lib/stellar/explorer";

export const dynamic = "force-dynamic";

export default async function SubmissionPage() {
  const data = await getSubmissionPageData();

  return (
    <div className="space-y-6">
      <PageIntro
        description="Current Level 5 readiness view across repo hygiene, deployed app, contract deployment, 50-user proof, analytics activity, feedback iteration, and public deliverables."
        eyebrow="Submission"
        title="Startup Track Level 5 checklist"
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Commit count" value={String(data.commitCount)} />
        <Stat label="User proof" value={String(data.userCount)} />
        <Stat label="Feedback count" value={String(data.feedbackCount)} />
        <Stat label="Unique wallets" value={String(data.uniqueWallets)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Contract deployment</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoRow
              label="Network"
              value={data.contract.network}
            />
            <InfoRow
              href={contractExplorerUrl(data.contract.contractId)}
              label="Contract ID"
              value={data.contract.contractId || "Pending"}
            />
            <InfoRow
              href={addressExplorerUrl(data.contract.deployerPublicKey)}
              label="Deployer"
              value={data.contract.deployerPublicKey || "Pending"}
            />
            <InfoRow
              label="Deploy command"
              mono
              value={data.contract.deployCommand}
            />
            <InfoRow
              label="Verification command"
              mono
              value={data.contract.testCommand}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <HashCard
              hash={data.contract.installTxHash}
              title="WASM install tx"
            />
            <HashCard
              hash={data.contract.deployTxHash}
              title="Contract deploy tx"
            />
          </div>
        </div>

        <div className="surface-panel rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Reviewer notes</p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
            <p>
              Level 5 proof is stored in Prisma and mirrored to docs: 50 synthetic QA users, wallet proof rows,
              feedback records, analytics events, and representative Stellar testnet transaction hashes.
            </p>
            <p>
              Live app proof is configured. Demo video remains pending until an actual screen recording is attached.
            </p>
            <p>
              Synthetic QA proof is clearly labeled and should not be submitted as real external user acquisition.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <WalletConnectFeature />
        <ContractIntegrationPanel />
      </section>

      <SubmissionChecklist checklist={data.checklist} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel rounded-[1.5rem] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({
  href,
  label,
  mono = false,
  value,
}: {
  href?: string;
  label: string;
  mono?: boolean;
  value: string;
}) {
  const className = mono ? "mt-2 break-all font-mono text-sm text-foreground" : "mt-2 break-all text-sm text-foreground";

  return (
    <div className="rounded-[1.25rem] border border-border bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      {href ? (
        <a className={className} href={href} rel="noreferrer" target="_blank">
          {value}
        </a>
      ) : (
        <p className={className}>{value}</p>
      )}
    </div>
  );
}

function HashCard({ hash, title }: { hash: string; title: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{title}</p>
      <div className="mt-2">
        <TransactionHashLink hash={hash} label={hash ? `${title} explorer link` : undefined} />
      </div>
    </div>
  );
}

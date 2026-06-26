import Link from "next/link";

import { BondCard } from "@/components/bond-card";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/lib/server/dashboard";
import { serializeBondCase } from "@/lib/presenters";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageIntro
        actions={
          <>
            <Link href="/bonds/new">
              <Button>Create StudyBond</Button>
            </Link>
            <Link href="/submission">
              <Button variant="secondary">Open submission checklist</Button>
            </Link>
          </>
        }
        description="Real-time operating view across funded cases, wallet interactions, dispute volume, and product validation signals."
        eyebrow="Operations"
        title="StudyBond control center"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard hint="Cases created in the app database." label="Total cases" value={data.totals.totalCases} />
        <MetricCard hint="Cases with funds locked on the testnet flow." label="Funded cases" value={data.totals.fundedCases} />
        <MetricCard hint="Total XLM-equivalent value across active cases." label="Locked value" value={data.totals.totalLockedValue.toFixed(2)} />
        <MetricCard hint="Successful and failed proof rows captured." label="Wallet interactions" value={data.totals.walletInteractionsCount} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Latest StudyBond cases</h2>
            <Link className="text-sm font-semibold text-brand" href="/bonds">
              View all cases
            </Link>
          </div>

          {data.latestCases.length === 0 ? (
            <EmptyState
              actionHref="/bonds/new"
              actionLabel="Create first StudyBond"
              description="No cases have been created yet. Start with onboarding and case creation."
              title="No StudyBond cases yet"
            />
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {data.latestCases.map((item) => {
                const serialized = serializeBondCase(item);
                return (
                  <BondCard
                    key={serialized.id}
                    amount={serialized.amount}
                    assetCode={serialized.assetCode}
                    caseType={serialized.caseType}
                    createdAt={serialized.createdAt}
                    fundTxHash={serialized.fundTxHash}
                    id={serialized.id}
                    status={serialized.status}
                    studentName={serialized.studentName}
                    studentWalletAddress={serialized.studentWalletAddress}
                    targetCountry={serialized.targetCountry}
                    verifierName={serialized.verifierName}
                  />
                );
              })}
            </div>
          )}
        </div>

        <section className="surface-panel rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Recent activity</h2>
            <Link className="text-sm font-semibold text-brand" href="/wallet-proofs">
              Wallet proofs
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {data.recentActivity.map((item) => (
              <article key={item.id} className="rounded-[1.5rem] border border-border bg-white/70 p-4">
                <p className="text-sm font-semibold">{item.message}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                  {item.action} · {item.actorRole}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

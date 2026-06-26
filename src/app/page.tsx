import Link from "next/link";
import { ArrowRight, Building2, House, Landmark, ShieldCheck, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { APP_NAME, APP_TAGLINE, STELLAR_TESTNET_DISCLAIMER, WALLET_OPTIONS } from "@/lib/constants";
import { getDashboardData } from "@/lib/server/dashboard";

export const dynamic = "force-dynamic";

const useCases = [
  {
    icon: Building2,
    title: "Admission and tuition hold",
    description:
      "Show a school or agency that funds are locked and only released once the agreed condition is met.",
  },
  {
    icon: House,
    title: "Dorm and rental deposit",
    description:
      "Avoid sending blind cross-border deposits to a landlord or housing operator without an auditable refund path.",
  },
  {
    icon: Landmark,
    title: "Visa proof-of-funds workflow",
    description:
      "Provide a public-safe verification page instead of passing screenshots across email threads and spreadsheets.",
  },
];

export default async function HomePage() {
  const dashboard = await getDashboardData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-6 md:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted">{APP_NAME}</p>
          <p className="mt-1 text-sm text-muted">{APP_TAGLINE}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/onboarding">
            <Button variant="secondary">Onboarding</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Open app</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] space-y-8 px-4 pb-14 md:px-8">
        <section className="grid gap-6 overflow-hidden rounded-[2.5rem] bg-foreground px-6 py-8 text-white md:px-10 md:py-12 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/55">
              Proof, purpose, conditional release
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              Cross-border student deposits with a visible rulebook.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/74">
              StudyBond is a Stellar testnet MVP for du học proof-of-funds, housing deposits,
              and tuition reservation workflows. Funds move with an explicit purpose, auditable
              release conditions, and a public-safe verification layer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/onboarding">
                <Button>Start onboarding</Button>
              </Link>
              <Link href="/submission">
                <Button variant="secondary">Review submission readiness</Button>
              </Link>
            </div>
            <p className="mt-6 max-w-2xl text-sm text-white/60">{STELLAR_TESTNET_DISCLAIMER}</p>
          </div>

          <div className="grid gap-4 self-end">
            <div className="rounded-[2rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/55">
                Supported wallets
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {WALLET_OPTIONS.map((wallet) => (
                  <div key={wallet.value} className="rounded-[1.5rem] bg-white/10 p-4">
                    <p className="text-lg font-semibold">{wallet.label}</p>
                    <p className="mt-2 text-sm text-white/70">
                      Multi-wallet adapter layer with install guidance, network checks, and signature rejection handling.
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard label="Current cases" value={dashboard.totals.totalCases} />
              <MetricCard label="Wallet proofs" value={dashboard.totals.walletInteractionsCount} />
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="surface-panel rounded-[1.75rem] p-5">
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-panel rounded-[2rem] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">How it works</p>
            <div className="mt-5 space-y-5">
              {[
                "Student or parent creates a case with the verifier and mediator addresses.",
                "A Freighter or Rabet signature funds the Soroban escrow contract on Stellar testnet.",
                "Public-safe verify pages show status, amount, tx hash, and the latest auditable state.",
                "Evidence metadata, release approvals, refund requests, and disputes keep the flow structured.",
              ].map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-foreground text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel rounded-[2rem] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Why Stellar</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                "Fast testnet settlement for demoable contract flows",
                "Soroban contract logic for release, refund, dispute, and expiry rules",
                "Explorer-friendly transaction proofs for reviewers",
                "Wallet ecosystem with Freighter and Rabet in the main signing path",
              ].map((value) => (
                <div key={value} className="rounded-[1.5rem] bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-5 text-brand" />
                    <p className="text-sm leading-7 text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-[2.25rem] bg-brand-soft/55 px-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Validation</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Technical wallet proofs and user feedback are separated on purpose.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              StudyBond keeps real wallet interaction evidence on `/wallet-proofs`, generated testnet identities on `/test-wallets`,
              and product validation feedback on `/feedback` so reviewers can see exactly what is technical proof vs. user signal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/wallet-proofs">
              <Button variant="secondary">
                <WalletCards className="size-4" />
                View wallet proofs
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button>
                Open StudyBond
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

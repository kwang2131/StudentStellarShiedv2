import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  House,
  Landmark,
  Orbit,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import {
  APP_NAME,
  APP_TAGLINE,
  STELLAR_TESTNET_DISCLAIMER,
  WALLET_OPTIONS,
} from "@/lib/constants";
import { getDashboardData } from "@/lib/server/dashboard";

export const dynamic = "force-dynamic";

const useCases = [
  {
    description:
      "Show a school or agency that funds are locked and only released once the agreed condition is met.",
    icon: Building2,
    title: "Admission and tuition hold",
  },
  {
    description:
      "Avoid sending blind cross-border deposits to a landlord or housing operator without an auditable refund path.",
    icon: House,
    title: "Dorm and rental deposit",
  },
  {
    description:
      "Provide a public-safe verification page instead of passing screenshots across email threads and spreadsheets.",
    icon: Landmark,
    title: "Visa proof-of-funds workflow",
  },
];

export default async function HomePage() {
  const dashboard = await getDashboardData();
  const metrics = [
    {
      hint: "Cases already stored in the application database.",
      label: "Current cases",
      value: dashboard.totals.totalCases,
    },
    {
      hint: "Wallet interactions captured from real product flows.",
      label: "Wallet proofs",
      value: dashboard.totals.walletInteractionsCount,
    },
    {
      hint: "Cases that reached contract-funded state on testnet.",
      label: "Funded cases",
      value: dashboard.totals.fundedCases,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-[1420px] items-center justify-between px-4 py-6 md:px-8">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#081427,#0059c7)] text-white shadow-[0_18px_44px_rgba(0,89,199,0.2)]">
            <Orbit className="size-5" />
          </span>
          <div>
            <p className="display-eyebrow text-xs text-muted">{APP_NAME}</p>
            <p className="mt-1 text-sm text-muted">{APP_TAGLINE}</p>
          </div>
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

      <main className="mx-auto max-w-[1420px] space-y-8 px-4 pb-14 md:px-8">
        <section className="grid gap-6 overflow-hidden rounded-[2.7rem] bg-[linear-gradient(145deg,#071121,#112b54_58%,#0059c7)] px-6 py-8 text-white shadow-[0_28px_82px_rgba(4,19,44,0.24)] md:px-10 md:py-12 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="display-eyebrow text-xs text-white/55">
              Proof, purpose, conditional release
            </p>
            <h1 className="display-title mt-4 max-w-3xl text-5xl font-semibold leading-[0.94] md:text-7xl">
              Cross-border deposits that show what the money is for.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/74">
              StudyBond is a Stellar testnet MVP for du hoc proof-of-funds, housing deposits,
              and tuition reservation workflows. Funds move with an explicit purpose, auditable
              release conditions, and a public-safe verification layer.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/82">
                Freighter + Rabet live wallet path
              </span>
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/82">
                Soroban escrow logic
              </span>
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/82">
                Public-safe verification
              </span>
            </div>

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
            <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[1.9rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="display-eyebrow text-xs text-white/55">Wallet lanes</p>
                <div className="mt-4 space-y-3">
                  {WALLET_OPTIONS.map((wallet) => (
                    <div
                      key={wallet.value}
                      className="rounded-[1.35rem] border border-white/10 bg-white/10 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-semibold">{wallet.label}</p>
                        <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82">
                          Ready
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-white/70">
                        Live extension path with install guidance, network checks, and signature rejection handling.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.9rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <p className="display-eyebrow text-xs text-white/55">Signal board</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.5rem] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/56">Locked flow</p>
                    <p className="display-title mt-2 text-3xl font-semibold">
                      {dashboard.totals.totalLockedValue.toFixed(2)} XLM
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/70">
                      Tracked as testnet value across active StudyBond cases.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1.35rem] border border-white/12 bg-white/6 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/56">Proof rows</p>
                      <p className="mt-2 text-2xl font-semibold">{dashboard.totals.walletInteractionsCount}</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/12 bg-white/6 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/56">Funded cases</p>
                      <p className="mt-2 text-2xl font-semibold">{dashboard.totals.fundedCases}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/12 bg-white/6 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/84">
                      <CheckCircle2 className="size-4 text-accent" />
                      Review surface separated on purpose
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/68">
                      Wallet proof, product feedback, and submission evidence live in separate routes so technical proof and product signal do not get mixed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-panel rounded-[2rem] p-6">
            <p className="display-eyebrow text-xs text-muted">Why this exists</p>
            <h2 className="display-title mt-3 max-w-2xl text-4xl font-semibold">
              International student deposits are still handled with screenshots, trust, and fragmented approvals.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              StudyBond gives the student, parent, institution, agency, and mediator one visible rulebook. The contract state becomes the reference point instead of email threads and manual receipts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((item) => (
              <MetricCard
                key={item.label}
                hint={item.hint}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-4">
          {[
            "Student or parent creates a case with the verifier and mediator addresses.",
            "A Freighter or Rabet signature funds the Soroban escrow contract on Stellar testnet.",
            "Public-safe verify pages show status, amount, tx hash, and the latest auditable state.",
            "Evidence metadata, release approvals, refund requests, and disputes keep the flow structured.",
          ].map((step, index) => (
            <article key={step} className="surface-panel rounded-[1.85rem] p-5">
              <div className="flex size-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#081427,#0059c7)] text-white">
                {index + 1}
              </div>
              <p className="display-eyebrow mt-5 text-xs text-muted">Step 0{index + 1}</p>
              <p className="mt-3 text-sm leading-7 text-foreground">{step}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-5 lg:grid-cols-3">
            {useCases.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="surface-panel rounded-[1.75rem] p-5">
                  <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="display-title mt-4 text-2xl font-semibold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="surface-panel rounded-[2rem] p-6">
            <p className="display-eyebrow text-xs text-muted">Why Stellar</p>
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

        <section className="grid gap-6 rounded-[2.35rem] bg-[linear-gradient(135deg,rgba(217,235,255,0.72),rgba(255,255,255,0.92))] px-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="display-eyebrow text-xs text-muted">Validation</p>
            <h2 className="display-title mt-3 text-4xl font-semibold">
              Technical wallet proofs and user feedback are separated on purpose.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              StudyBond keeps real wallet interaction evidence on `/wallet-proofs`, generated testnet identities on `/test-wallets`, and product validation feedback on `/feedback` so reviewers can see exactly what is technical proof vs. user signal.
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

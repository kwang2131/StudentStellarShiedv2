"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { NetworkBadge } from "@/components/network-badge";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletSelector } from "@/components/wallet-selector";
import { useWallet } from "@/components/providers/wallet-provider";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/client/fetch-json";
import { ROLE_OPTIONS, STELLAR_TESTNET_DISCLAIMER } from "@/lib/constants";
import { onboardingSchema, type OnboardingInput } from "@/lib/server/validators";

export function OnboardingForm() {
  const router = useRouter();
  const {
    connecting,
    networkMismatch,
    role,
    session,
    setRole,
  } = useWallet();
  type OnboardingFormValues = z.input<typeof onboardingSchema>;

  const form = useForm<OnboardingFormValues, unknown, OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      email: "",
      name: "",
      role,
      targetCountry: "Canada",
      useCase: "DORM_DEPOSIT",
      walletAddress: session?.publicKey ?? "",
      walletProvider: session?.provider ?? "FREIGHTER",
    },
  });

  const submit = form.handleSubmit(async (values) => {
    if (!session) {
      toast.error("Connect Freighter or Rabet before completing onboarding.");
      return;
    }

    try {
      await fetchJson("/api/onboarding", {
        body: JSON.stringify({
          ...values,
          role,
          walletAddress: session.publicKey,
          walletProvider: session.provider,
        }),
        method: "POST",
      });

      toast.success("Onboarding saved.");
      router.push("/dashboard");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save onboarding.");
    }
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={submit}>
        <section className="surface-panel rounded-[1.75rem] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Step 1
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Choose your role</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ROLE_OPTIONS.map((item) => (
              <button
                key={item.value}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  role === item.value
                    ? "border-brand bg-brand-soft/55"
                    : "border-border bg-white/70"
                }`}
                onClick={() => {
                  setRole(item.value);
                  form.setValue("role", item.value);
                }}
                type="button"
              >
                <p className="text-lg font-semibold">{item.label}</p>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="surface-panel rounded-[1.75rem] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Step 2
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Select wallet provider</h2>
          <div className="mt-5">
            <WalletSelector />
          </div>
        </section>

        <section className="surface-panel rounded-[1.75rem] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Step 3
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Minimal profile</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field form={form} label="Full name" name="name" />
            <Field form={form} label="Email (optional)" name="email" type="email" />
            <Field form={form} label="Target country" name="targetCountry" />
            <Field form={form} label="Use case" name="useCase" />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-brand/20 bg-brand-soft/55 p-4">
          <p className="max-w-xl text-sm text-muted">
            {STELLAR_TESTNET_DISCLAIMER}
          </p>
          <Button disabled={form.formState.isSubmitting || !session} type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Complete onboarding"}
          </Button>
        </div>
      </form>

      <aside className="space-y-6">
        <section className="surface-panel rounded-[1.75rem] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Connection state
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Wallet session</h2>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <NetworkBadge mismatch={networkMismatch} network={session?.network} />
            <WalletConnectButton />
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <Detail label="Provider" value={session?.provider ?? "Not connected"} />
            <Detail label="Public key" value={session?.publicKey ?? "Pending"} />
            <Detail label="Balance" value={session?.balance ? `${session.balance} XLM` : "Unavailable"} />
            <Detail label="Status" value={connecting ? "Connecting..." : session ? "Connected" : "Waiting"} />
          </dl>
        </section>

        <section className="surface-panel rounded-[1.75rem] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Testnet mode
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Before you continue</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
            <li>Use Freighter or Rabet on Stellar testnet only.</li>
            <li>Wrong network or rejected signatures will not mutate StudyBond case state.</li>
            <li>Every successful or failed contract action is persisted for proof and audit review.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}

function Field({
  form,
  label,
  name,
  type = "text",
}: {
  form: UseFormReturn<z.input<typeof onboardingSchema>, unknown, OnboardingInput>;
  label: string;
  name: keyof z.input<typeof onboardingSchema>;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
}) {
  const error = form.formState.errors[name];

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      <input
        className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
        type={type}
        {...form.register(name)}
      />
      {error ? <span className="text-sm text-danger">{String(error.message)}</span> : null}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground break-all text-right">{value}</dd>
    </div>
  );
}

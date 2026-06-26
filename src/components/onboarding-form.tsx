"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getRoleExperience } from "@/components/navigation";
import { NetworkBadge } from "@/components/network-badge";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { WalletSelector } from "@/components/wallet-selector";
import { useWallet } from "@/components/providers/wallet-provider";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/client/fetch-json";
import { ROLE_OPTIONS, STELLAR_TESTNET_DISCLAIMER } from "@/lib/constants";
import { onboardingSchema, type OnboardingInput } from "@/lib/server/validators";
import { cn } from "@/lib/utils";

export function OnboardingForm() {
  const router = useRouter();
  const {
    connecting,
    networkMismatch,
    role,
    session,
    setRole,
  } = useWallet();
  const experience = getRoleExperience(role);
  const RoleIcon = experience.icon;
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
          <p className="display-eyebrow text-xs text-muted">
            Step 1
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h2 className="display-title text-2xl font-semibold">Choose your role</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
                The app shell, shortcut menu, and next actions switch immediately to match the actor using StudyBond.
              </p>
            </div>
            <span className="rounded-full border border-brand/14 bg-brand-soft/60 px-3 py-1 text-xs font-semibold text-brand-ink">
              Role-aware UX
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ROLE_OPTIONS.map((item) => {
              const active = role === item.value;
              const optionExperience = getRoleExperience(item.value);
              const OptionIcon = optionExperience.icon;

              return (
                <button
                  key={item.value}
                  className={cn(
                    "orb-ring rounded-[1.5rem] border p-5 text-left transition duration-200 hover:-translate-y-0.5",
                    active
                      ? "border-brand bg-brand-soft/45 shadow-[0_18px_42px_rgba(0,89,199,0.16)]"
                      : "border-border bg-white/70 hover:bg-white",
                  )}
                  onClick={() => {
                    setRole(item.value);
                    form.setValue("role", item.value);
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="display-eyebrow text-xs text-muted">{item.value.replaceAll("_", " ")}</p>
                      <p className="mt-3 text-lg font-semibold">{item.label}</p>
                    </div>
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-full",
                        active ? "bg-brand text-white" : "bg-brand-soft text-brand",
                      )}
                    >
                      <OptionIcon className="size-5" />
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-[1.65rem] bg-[linear-gradient(135deg,#081427,#0059c7)] p-5 text-white shadow-[0_22px_54px_rgba(0,89,199,0.24)]">
            <p className="display-eyebrow text-xs text-white/55">Current role mission</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/12 text-white">
                <RoleIcon className="size-5" />
              </span>
              <div>
                <h3 className="display-title text-2xl font-semibold">{experience.label}</h3>
                <p className="mt-1 text-sm text-white/70">{experience.summary}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {experience.focus.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold text-white/88"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel rounded-[1.75rem] p-5">
          <p className="display-eyebrow text-xs text-muted">
            Step 2
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">Select wallet provider</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            Freighter and Rabet stay as the only live wallet options in the main product flow. Install state is checked in-browser before connect.
          </p>
          <div className="mt-5">
            <WalletSelector />
          </div>
        </section>

        <section className="surface-panel rounded-[1.75rem] p-5">
          <p className="display-eyebrow text-xs text-muted">
            Step 3
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">Minimal profile</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field form={form} label="Full name" name="name" />
            <Field form={form} label="Email (optional)" name="email" type="email" />
            <Field form={form} label="Target country" name="targetCountry" />
            <Field form={form} label="Use case" name="useCase" />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.65rem] border border-brand/18 bg-[linear-gradient(135deg,rgba(217,235,255,0.88),rgba(255,255,255,0.9))] p-4 shadow-[0_18px_40px_rgba(0,89,199,0.08)]">
          <p className="max-w-xl text-sm leading-7 text-muted">
            {STELLAR_TESTNET_DISCLAIMER}
          </p>
          <Button disabled={form.formState.isSubmitting || !session} type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Complete onboarding"}
          </Button>
        </div>
      </form>

      <aside className="space-y-6">
        <section className="surface-panel rounded-[1.75rem] p-5">
          <p className="display-eyebrow text-xs text-muted">
            Connection state
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">Wallet session</h2>
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
          <p className="display-eyebrow text-xs text-muted">
            Testnet mode
          </p>
          <h2 className="display-title mt-2 text-2xl font-semibold">Before you continue</h2>
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

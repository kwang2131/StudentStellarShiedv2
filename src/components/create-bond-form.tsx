"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { fetchJson } from "@/lib/client/fetch-json";
import { CASE_TYPE_OPTIONS } from "@/lib/constants";
import { stellarConfig } from "@/lib/stellar/config";
import { createBondSchema, type CreateBondInput } from "@/lib/server/validators";

function defaultExpiryDate() {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function CreateBondForm() {
  const router = useRouter();
  const { role, session } = useWallet();
  type CreateBondFormValues = z.input<typeof createBondSchema>;

  const form = useForm<CreateBondFormValues, unknown, CreateBondInput>({
    resolver: zodResolver(createBondSchema),
    defaultValues: {
      amount: 100,
      assetCode: "XLM",
      assetContractAddress: stellarConfig.nativeAssetContractId,
      caseType: "DORM_DEPOSIT",
      expiryDate: defaultExpiryDate(),
      mediatorWalletAddress: "",
      notes: "",
      payerWalletAddress: "",
      refundCondition: "Refund to student or payer if visa or admission conditions fail.",
      releaseCondition: "Release to verifier after admission, reservation, or rental condition is confirmed.",
      studentName: "",
      studentWalletAddress: session?.publicKey ?? "",
      targetCountry: "Canada",
      verifierName: "",
      verifierWalletAddress: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!session) {
      toast.error("Connect a Stellar wallet before creating a case.");
      return;
    }

    if (role !== "STUDENT" && role !== "PARENT_GUARDIAN" && role !== "AGENCY") {
      toast.error("Switch to Student, Parent / Guardian, or Agency to create a case.");
      return;
    }

    try {
      const payload = {
        ...values,
        expiryDate: new Date(values.expiryDate).toISOString(),
      };

      const response = await fetchJson<{ bondCase: { id: string } }>("/api/bonds", {
        body: JSON.stringify(payload),
        method: "POST",
      });

      toast.success("StudyBond case created.");
      startTransition(() => {
        router.push(`/bonds/${response.bondCase.id}`);
      });
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create case.");
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-muted">Case type</span>
          <select className="w-full rounded-2xl border border-border bg-white px-4 py-3" {...form.register("caseType")}>
            {CASE_TYPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <Field label="Student name" name="studentName" form={form} />
        <Field label="Student wallet address" name="studentWalletAddress" form={form} />
        <Field label="Payer wallet address" name="payerWalletAddress" form={form} />
        <Field label="Verifier name" name="verifierName" form={form} />
        <Field label="Verifier wallet address" name="verifierWalletAddress" form={form} />
        <Field label="Mediator wallet address" name="mediatorWalletAddress" form={form} />
        <Field label="Target country" name="targetCountry" form={form} />
        <Field label="Amount" name="amount" form={form} type="number" />
        <Field label="Asset code" name="assetCode" form={form} />
        <Field label="Asset contract address" name="assetContractAddress" form={form} />
        <Field label="Expiry date" name="expiryDate" form={form} type="datetime-local" />
      </div>

      <TextAreaField label="Release condition" name="releaseCondition" form={form} />
      <TextAreaField label="Refund condition" name="refundCondition" form={form} />
      <TextAreaField label="Notes" name="notes" form={form} rows={4} />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-brand/20 bg-brand-soft/55 p-4">
        <p className="max-w-xl text-sm text-muted">
          The main flow expects live Freighter or Rabet signing. Contract initialization can be triggered from the case detail page once the global contract id is configured.
        </p>
        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Creating..." : "Create StudyBond"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  form,
  label,
  name,
  type = "text",
}: {
  form: UseFormReturn<z.input<typeof createBondSchema>, unknown, CreateBondInput>;
  label: string;
  name: keyof z.input<typeof createBondSchema>;
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

function TextAreaField({
  form,
  label,
  name,
  rows = 6,
}: {
  form: UseFormReturn<z.input<typeof createBondSchema>, unknown, CreateBondInput>;
  label: string;
  name: keyof z.input<typeof createBondSchema>;
  rows?: number;
}) {
  const error = form.formState.errors[name];

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      <textarea
        className="min-h-32 w-full rounded-[1.5rem] border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
        rows={rows}
        {...form.register(name)}
      />
      {error ? <span className="text-sm text-danger">{String(error.message)}</span> : null}
    </label>
  );
}

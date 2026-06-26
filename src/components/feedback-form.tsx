"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getRoleExperience } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { fetchJson } from "@/lib/client/fetch-json";
import { ROLE_OPTIONS } from "@/lib/constants";
import { feedbackSchema, type FeedbackInput } from "@/lib/server/validators";

export function FeedbackForm() {
  const router = useRouter();
  const { role, session } = useWallet();
  const experience = getRoleExperience(role);
  type FeedbackFormValues = z.input<typeof feedbackSchema>;
  const form = useForm<FeedbackFormValues, unknown, FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      comment: "",
      confusing: "",
      contact: "",
      rating: 4,
      role,
      walletAddress: session?.publicKey ?? "",
      workedWell: "",
      wouldUse: true,
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await fetchJson("/api/feedback", {
        body: JSON.stringify({
          ...values,
          role,
          walletAddress: session?.publicKey ?? values.walletAddress,
        }),
        method: "POST",
      });

      toast.success("Feedback submitted.");
      form.reset({
        ...form.getValues(),
        comment: "",
        confusing: "",
        workedWell: "",
      });
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to submit feedback.");
    }
  });

  return (
    <form className="surface-panel space-y-5 rounded-[1.85rem] p-5" onSubmit={submit}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="display-eyebrow text-xs text-muted">Product validation</p>
          <span className="rounded-full border border-brand/14 bg-brand-soft/60 px-3 py-1 text-xs font-semibold text-brand-ink">
            {experience.label}
          </span>
          {session ? (
            <span className="rounded-full border border-success/14 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              Wallet connected
            </span>
          ) : null}
        </div>
        <h3 className="display-title mt-2 text-2xl font-semibold">Share what worked and what did not</h3>
        <p className="mt-2 text-sm leading-7 text-muted">
          Feedback stays separate from wallet proof so product signal can be reviewed without mixing it with onchain evidence.
        </p>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-muted">Role</span>
        <select className="w-full rounded-2xl border border-border bg-white px-4 py-3" {...form.register("role")}>
          {ROLE_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <FormInput form={form} label="Wallet address" name="walletAddress" />
      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <FormInput form={form} label="Rating (1-5)" name="rating" type="number" />
        <label className="flex items-center gap-3 rounded-[1.5rem] border border-border bg-white px-4 py-3">
          <input type="checkbox" {...form.register("wouldUse")} />
          <span className="text-sm text-foreground">
            I would use this for a real proof-of-funds or deposit workflow.
          </span>
        </label>
      </div>

      <FormTextarea form={form} label="What worked well" name="workedWell" />
      <FormTextarea form={form} label="What was confusing" name="confusing" />
      <FormTextarea form={form} label="Comment" name="comment" />
      <FormInput form={form} label="Optional contact" name="contact" />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.55rem] border border-brand/14 bg-[linear-gradient(135deg,rgba(217,235,255,0.82),rgba(255,255,255,0.94))] p-4">
        <p className="max-w-xl text-sm leading-7 text-muted">
          Use this form for product clarity, trust, and workflow feedback. Technical wallet and contract proof belong on the proof and analytics surfaces.
        </p>
        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Submitting..." : "Submit feedback"}
        </Button>
      </div>
    </form>
  );
}

function FormInput({
  form,
  label,
  name,
  type = "text",
}: {
  form: UseFormReturn<z.input<typeof feedbackSchema>, unknown, FeedbackInput>;
  label: string;
  name: keyof z.input<typeof feedbackSchema>;
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

function FormTextarea({
  form,
  label,
  name,
}: {
  form: UseFormReturn<z.input<typeof feedbackSchema>, unknown, FeedbackInput>;
  label: string;
  name: keyof z.input<typeof feedbackSchema>;
}) {
  const error = form.formState.errors[name];

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      <textarea
        className="min-h-28 w-full rounded-[1.5rem] border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
        {...form.register(name)}
      />
      {error ? <span className="text-sm text-danger">{String(error.message)}</span> : null}
    </label>
  );
}

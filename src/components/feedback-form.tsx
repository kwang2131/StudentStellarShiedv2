"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { fetchJson } from "@/lib/client/fetch-json";
import { ROLE_OPTIONS } from "@/lib/constants";
import { feedbackSchema, type FeedbackInput } from "@/lib/server/validators";

export function FeedbackForm() {
  const router = useRouter();
  const { role, session } = useWallet();
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
    <form className="surface-panel space-y-4 rounded-[1.75rem] p-5" onSubmit={submit}>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
          Product validation
        </p>
        <h3 className="mt-2 text-2xl font-semibold">Share what worked and what did not</h3>
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
      <FormInput form={form} label="Rating (1-5)" name="rating" type="number" />
      <FormTextarea form={form} label="What worked well" name="workedWell" />
      <FormTextarea form={form} label="What was confusing" name="confusing" />
      <FormTextarea form={form} label="Comment" name="comment" />
      <FormInput form={form} label="Optional contact" name="contact" />

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <input type="checkbox" {...form.register("wouldUse")} />
        <span className="text-sm text-foreground">
          I would use this for a real proof-of-funds or deposit workflow.
        </span>
      </label>

      <Button disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Submitting..." : "Submit feedback"}
      </Button>
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

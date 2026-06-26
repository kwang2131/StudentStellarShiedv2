"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { fetchJson } from "@/lib/client/fetch-json";
import { EVIDENCE_CATEGORY_OPTIONS } from "@/lib/constants";
import { evidenceMetadataSchema, type EvidenceMetadataInput } from "@/lib/server/validators";

export function EvidenceUploadCard({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { role, session } = useWallet();
  const form = useForm<EvidenceMetadataInput>({
    resolver: zodResolver(evidenceMetadataSchema),
    defaultValues: {
      category: "DORM_RESERVATION",
      description: "",
      fileHash: "",
      fileName: "",
      fileUrl: "",
      relatedCondition: "",
      uploadedByRole: role,
      uploadedByWallet: session?.publicKey ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!session) {
      toast.error("Connect a wallet before attaching evidence metadata.");
      return;
    }

    try {
      await fetchJson(`/api/bonds/${caseId}/evidence`, {
        body: JSON.stringify({
          ...values,
          uploadedByRole: role,
          uploadedByWallet: session.publicKey,
        }),
        method: "POST",
      });

      toast.success("Evidence metadata saved.");
      form.reset({
        ...form.getValues(),
        description: "",
        fileHash: "",
        fileName: "",
        fileUrl: "",
        relatedCondition: "",
      });
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save evidence.");
    }
  });

  return (
    <form className="surface-panel space-y-4 rounded-[1.75rem] p-5" onSubmit={onSubmit}>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
          Evidence metadata
        </p>
        <h3 className="mt-2 text-2xl font-semibold">Add a document reference</h3>
        <p className="mt-2 text-sm text-muted">
          Store document metadata off-chain, then use the action panel to commit the relevant hash on-chain if needed.
        </p>
      </div>

      <select className="w-full rounded-2xl border border-border bg-white px-4 py-3" {...form.register("category")}>
        {EVIDENCE_CATEGORY_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <InputField form={form} label="File name" name="fileName" />
      <InputField form={form} label="File URL" name="fileUrl" />
      <InputField form={form} label="Hash / reference" name="fileHash" />
      <InputField form={form} label="Related condition" name="relatedCondition" />
      <TextField form={form} label="Description" name="description" />

      <Button disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Saving..." : "Save evidence metadata"}
      </Button>
    </form>
  );
}

function InputField({
  form,
  label,
  name,
}: {
  form: ReturnType<typeof useForm<EvidenceMetadataInput>>;
  label: string;
  name: keyof EvidenceMetadataInput;
}) {
  const error = form.formState.errors[name];

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      <input
        className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
        {...form.register(name)}
      />
      {error ? <span className="text-sm text-danger">{String(error.message)}</span> : null}
    </label>
  );
}

function TextField({
  form,
  label,
  name,
}: {
  form: ReturnType<typeof useForm<EvidenceMetadataInput>>;
  label: string;
  name: keyof EvidenceMetadataInput;
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

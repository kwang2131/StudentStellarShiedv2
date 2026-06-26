"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/wallet-provider";
import { fetchJson } from "@/lib/client/fetch-json";
import { sha256Hex } from "@/lib/client/hash";

export function DisputeResolutionPanel({
  amount,
  caseId,
  disabled = false,
}: {
  amount: string;
  caseId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { provider, role, session, signTransaction } = useWallet();
  const [resolutionNote, setResolutionNote] = useState("Mediator resolution memo");
  const [studentAmount, setStudentAmount] = useState(amount);
  const [verifierAmount, setVerifierAmount] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!session) {
      toast.error("Connect mediator wallet first.");
      return;
    }

    setSubmitting(true);

    try {
      const resolutionHash = await sha256Hex(resolutionNote);
      const prepare = await fetchJson<{ prepared: { xdr: string } }>(`/api/bonds/${caseId}/actions`, {
        body: JSON.stringify({
          action: "RESOLVE_DISPUTE",
          phase: "prepare",
          resolutionHash,
          role,
          studentAmount: Number(studentAmount),
          verifierAmount: Number(verifierAmount),
          walletAddress: session.publicKey,
          walletProvider: provider,
        }),
        method: "POST",
      });

      const signed = await signTransaction(prepare.prepared.xdr, session.publicKey);

      await fetchJson(`/api/bonds/${caseId}/actions`, {
        body: JSON.stringify({
          action: "RESOLVE_DISPUTE",
          phase: "submit",
          resolutionHash,
          role,
          signedXdr: signed.signedTxXdr,
          studentAmount: Number(studentAmount),
          verifierAmount: Number(verifierAmount),
          walletAddress: session.publicKey,
          walletProvider: provider,
        }),
        method: "POST",
      });

      toast.success("Dispute resolution submitted.");
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Resolution failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="surface-panel rounded-[1.75rem] p-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
          Mediator path
        </p>
        <h3 className="mt-2 text-2xl font-semibold">Resolve a disputed StudyBond</h3>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-muted">Student amount</span>
          <input
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
            onChange={(event) => setStudentAmount(event.currentTarget.value)}
            type="number"
            value={studentAmount}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-muted">Verifier amount</span>
          <input
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
            onChange={(event) => setVerifierAmount(event.currentTarget.value)}
            type="number"
            value={verifierAmount}
          />
        </label>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium text-muted">Resolution memo</span>
        <textarea
          className="min-h-28 w-full rounded-[1.5rem] border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
          onChange={(event) => setResolutionNote(event.currentTarget.value)}
          value={resolutionNote}
        />
      </label>

      <Button
        className="mt-5"
        disabled={disabled || submitting}
        onClick={() => void submit()}
      >
        {submitting ? "Submitting..." : "Resolve dispute"}
      </Button>
    </section>
  );
}

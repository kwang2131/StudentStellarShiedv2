"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/error-state";
import { useWallet } from "@/components/providers/wallet-provider";
import { fetchJson } from "@/lib/client/fetch-json";
import { sha256Hex } from "@/lib/client/hash";
import { canRolePerformAction } from "@/lib/server/policies";

interface BondActionResponse {
  prepared?: {
    action: string;
    contractAddress: string;
    sourceAddress: string;
    xdr: string;
  };
  result?: {
    contractAddress?: string;
    success: boolean;
    txHash?: string;
  };
}

interface FundingActionPanelProps {
  amount: string;
  caseId: string;
  hasContract: boolean;
  status: string;
}

const actionRequirements = {
  APPROVE_RELEASE: { field: "releaseHash", label: "Release memo" },
  OPEN_DISPUTE: { field: "disputeHash", label: "Dispute memo" },
  REQUEST_REFUND: { field: "refundReasonHash", label: "Refund reason" },
  SUBMIT_EVIDENCE: { field: "evidenceHash", label: "Evidence hash" },
} as const;

type SupportedAction = keyof typeof actionRequirements | "FUND_BOND" | "INITIALIZE_CASE" | "APPROVE_REFUND" | "EXPIRE_CASE";

export function FundingActionPanel({
  amount,
  caseId,
  hasContract,
  status,
}: FundingActionPanelProps) {
  const router = useRouter();
  const { provider, role, session, signTransaction } = useWallet();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<SupportedAction | null>(null);
  const can = (action: SupportedAction) => canRolePerformAction(action, role);

  if (!session) {
    return (
      <ErrorState
        description="Connect Freighter or Rabet to prepare and submit live Stellar testnet transactions from this case."
        title="Wallet required"
      />
    );
  }

  const runAction = async (action: SupportedAction) => {
    setSubmitting(action);

    const extraField =
      action in actionRequirements
        ? actionRequirements[action as keyof typeof actionRequirements].field
        : null;
    const note = notes[action] ?? "";

    try {
      const prepareBody: Record<string, unknown> = {
        action,
        phase: "prepare",
        role,
        walletAddress: session.publicKey,
        walletProvider: provider,
      };

      if (action === "FUND_BOND") {
        prepareBody.amount = Number(amount);
      }

      if (extraField) {
        prepareBody[extraField] = await sha256Hex(
          note || `${action}:${caseId}:${session.publicKey}`,
        );
      }

      const prepared = await fetchJson<BondActionResponse>(`/api/bonds/${caseId}/actions`, {
        body: JSON.stringify(prepareBody),
        method: "POST",
      });

      if (!prepared.prepared?.xdr) {
        throw new Error("Prepared transaction XDR is missing.");
      }

      const signed = await signTransaction(prepared.prepared.xdr, session.publicKey);

      const submitted = await fetchJson<BondActionResponse>(`/api/bonds/${caseId}/actions`, {
        body: JSON.stringify({
          ...prepareBody,
          phase: "submit",
          signedXdr: signed.signedTxXdr,
        }),
        method: "POST",
      });

      if (!submitted.result?.success) {
        throw new Error("Transaction submission was not confirmed.");
      }

      toast.success(`${action.replaceAll("_", " ")} confirmed on testnet.`);
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unable to submit the contract action.";

      await fetchJson(`/api/bonds/${caseId}/actions`, {
        body: JSON.stringify({
          action,
          errorMessage: message,
          phase: "failure",
          role,
          walletAddress: session.publicKey,
          walletProvider: provider,
        }),
        method: "POST",
      }).catch(() => undefined);

      toast.error(message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <section className="surface-panel space-y-5 rounded-[1.75rem] p-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
          Contract actions
        </p>
        <h3 className="mt-2 text-2xl font-semibold">Role-aware transaction panel</h3>
        <p className="mt-2 text-sm text-muted">
          Current role: {role.replaceAll("_", " ")}. Current wallet: {session.publicKey}. Case status: {status}.
        </p>
      </div>

      {!hasContract ? (
        <ErrorState
          description="NEXT_PUBLIC_STELLAR_CONTRACT_ID is blank. Deploy the Soroban contract, update env, and retry the main flow."
          title="Contract not configured"
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {can("INITIALIZE_CASE") ? (
          <ActionCard
            busy={submitting === "INITIALIZE_CASE"}
            disabled={!hasContract}
            label="Initialize case"
            onSubmit={() => void runAction("INITIALIZE_CASE")}
          />
        ) : null}
        {can("FUND_BOND") ? (
          <ActionCard
            busy={submitting === "FUND_BOND"}
            disabled={!hasContract}
            label="Fund StudyBond"
            onSubmit={() => void runAction("FUND_BOND")}
          />
        ) : null}
        {can("SUBMIT_EVIDENCE") ? (
          <ActionCard
            busy={submitting === "SUBMIT_EVIDENCE"}
            description="Add a short memo or paste an evidence hash."
            disabled={!hasContract}
            label="Submit evidence"
            note={notes.SUBMIT_EVIDENCE || ""}
            onChange={(value) => setNotes((current) => ({ ...current, SUBMIT_EVIDENCE: value }))}
            onSubmit={() => void runAction("SUBMIT_EVIDENCE")}
            placeholder="Evidence note or hash"
          />
        ) : null}
        {can("APPROVE_RELEASE") ? (
          <ActionCard
            busy={submitting === "APPROVE_RELEASE"}
            description="Verifier path to release the bond."
            disabled={!hasContract}
            label="Approve release"
            note={notes.APPROVE_RELEASE || ""}
            onChange={(value) => setNotes((current) => ({ ...current, APPROVE_RELEASE: value }))}
            onSubmit={() => void runAction("APPROVE_RELEASE")}
            placeholder="Release memo"
          />
        ) : null}
        {can("REQUEST_REFUND") ? (
          <ActionCard
            busy={submitting === "REQUEST_REFUND"}
            disabled={!hasContract}
            label="Request refund"
            note={notes.REQUEST_REFUND || ""}
            onChange={(value) => setNotes((current) => ({ ...current, REQUEST_REFUND: value }))}
            onSubmit={() => void runAction("REQUEST_REFUND")}
            placeholder="Refund reason"
          />
        ) : null}
        {can("APPROVE_REFUND") ? (
          <ActionCard
            busy={submitting === "APPROVE_REFUND"}
            disabled={!hasContract}
            label="Approve refund"
            onSubmit={() => void runAction("APPROVE_REFUND")}
          />
        ) : null}
        {can("OPEN_DISPUTE") ? (
          <ActionCard
            busy={submitting === "OPEN_DISPUTE"}
            disabled={!hasContract}
            label="Open dispute"
            note={notes.OPEN_DISPUTE || ""}
            onChange={(value) => setNotes((current) => ({ ...current, OPEN_DISPUTE: value }))}
            onSubmit={() => void runAction("OPEN_DISPUTE")}
            placeholder="Dispute context"
          />
        ) : null}
        {can("EXPIRE_CASE") ? (
          <ActionCard
            busy={submitting === "EXPIRE_CASE"}
            disabled={!hasContract}
            label="Expire case"
            onSubmit={() => void runAction("EXPIRE_CASE")}
          />
        ) : null}
      </div>
    </section>
  );
}

function ActionCard({
  busy,
  description,
  disabled,
  label,
  note,
  onChange,
  onSubmit,
  placeholder,
}: {
  busy: boolean;
  description?: string;
  disabled?: boolean;
  label: string;
  note?: string;
  onChange?: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-white/70 p-4">
      <h4 className="text-lg font-semibold">{label}</h4>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      {onChange ? (
        <textarea
          className="mt-4 min-h-24 w-full rounded-[1.25rem] border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
          onChange={(event) => onChange(event.currentTarget.value)}
          placeholder={placeholder}
          value={note}
        />
      ) : null}
      <Button
        className="mt-4 w-full"
        disabled={disabled || busy}
        onClick={onSubmit}
        variant="secondary"
      >
        {busy ? "Submitting..." : label}
      </Button>
    </article>
  );
}

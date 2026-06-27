import { getActionRoles } from "@/lib/server/policies";
import {
  getStudyBondSorobanContract,
  studyBondContractMethods,
  studyBondFrontendContractIntegrations,
} from "@/lib/stellar/contract";
import { stellarConfig } from "@/lib/stellar/config";
import { roleLabel } from "@/lib/utils";

export function ContractIntegrationPanel() {
  const contract = getStudyBondSorobanContract(stellarConfig.contractId);

  return (
    <section className="surface-panel rounded-[1.75rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Soroban integration</p>
          <h2 className="mt-2 text-2xl font-semibold">Frontend to contract function coverage</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
            The app prepares transactions with <span className="font-mono text-foreground">@stellar/stellar-sdk</span>,
            signs them through Freighter or Rabet, and submits them through a single reviewer-visible
            API route at <span className="font-mono text-foreground">/api/bonds/[id]/actions</span>.
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-border bg-white/70 px-4 py-3 text-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Contract status</p>
          <p className="mt-2 font-semibold text-foreground">
            {contract ? "Configured and instantiable" : "Missing NEXT_PUBLIC_STELLAR_CONTRACT_ID"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Metric label="Write methods wired" value={String(studyBondFrontendContractIntegrations.length)} />
        <Metric label="Total methods documented" value={String(studyBondContractMethods.length)} />
        <Metric label="SDK package" value="@stellar/stellar-sdk" />
      </div>

      <div className="mt-5 grid gap-4">
        {studyBondFrontendContractIntegrations.map((item) => (
          <article key={item.action} className="rounded-[1.5rem] border border-border bg-white/70 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
                {item.action}
              </span>
              <span className="rounded-full border border-border px-3 py-1 font-mono text-xs text-foreground">
                {item.contractMethod}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">
                {item.frontendRoute}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Detail label="Source file" value={item.sourceFile} />
              <Detail label="API route" value={item.apiRoute} />
              <Detail
                label="Allowed roles"
                value={getActionRoles(item.action).map(roleLabel).join(", ")}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.requestFields.map((field) => (
                <span
                  key={field}
                  className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-muted"
                >
                  {field}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 break-all text-sm text-foreground">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-border bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

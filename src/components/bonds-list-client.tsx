"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { BondCard } from "@/components/bond-card";
import { EmptyState } from "@/components/empty-state";
import { CASE_TYPE_OPTIONS, STATUS_ORDER } from "@/lib/constants";
import { eventLabel } from "@/lib/utils";

interface BondSummary {
  amount: string;
  assetCode: string;
  caseType: string;
  createdAt: string;
  fundTxHash?: string | null;
  id: string;
  status: Parameters<typeof BondCard>[0]["status"];
  studentName: string;
  studentWalletAddress: string;
  targetCountry: string;
  verifierName: string;
}

export function BondsListClient({ cases }: { cases: BondSummary[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [caseType, setCaseType] = useState("ALL");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return cases.filter((item) => {
      const matchesSearch =
        !query ||
        item.studentName.toLowerCase().includes(query) ||
        item.verifierName.toLowerCase().includes(query) ||
        item.targetCountry.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);

      const matchesStatus = status === "ALL" || item.status === status;
      const matchesCaseType = caseType === "ALL" || item.caseType === caseType;

      return matchesSearch && matchesStatus && matchesCaseType;
    });
  }, [caseType, cases, deferredSearch, status]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 rounded-[1.75rem] border border-border bg-white/70 p-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
        <input
          className="rounded-2xl border border-border bg-white px-4 py-3 outline-none ring-brand/25 focus:ring-4"
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search by student, verifier, country, or case id"
          value={search}
        />
        <select
          className="rounded-2xl border border-border bg-white px-4 py-3 outline-none"
          onChange={(event) => setStatus(event.currentTarget.value)}
          value={status}
        >
          <option value="ALL">All statuses</option>
          {STATUS_ORDER.map((item) => (
            <option key={item} value={item}>
              {eventLabel(item as never)}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-border bg-white px-4 py-3 outline-none"
          onChange={(event) => setCaseType(event.currentTarget.value)}
          value={caseType}
        >
          <option value="ALL">All case types</option>
          {CASE_TYPE_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          actionHref="/bonds/new"
          actionLabel="Create StudyBond"
          description="No cases match the current filters. Start a new StudyBond or widen the search."
          title="No matching cases"
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((item) => (
            <BondCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}

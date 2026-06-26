"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { BondCard } from "@/components/bond-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { CASE_TYPE_OPTIONS, STATUS_ORDER } from "@/lib/constants";
import { cn, eventLabel } from "@/lib/utils";

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
  const hasActiveFilters =
    search.trim().length > 0 || status !== "ALL" || caseType !== "ALL";

  return (
    <section className="space-y-6">
      <div className="surface-panel rounded-[1.85rem] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="display-eyebrow text-[11px] text-muted">Case filters</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="display-title text-2xl font-semibold text-foreground">
                Case explorer
              </h2>
              <span className="rounded-full border border-brand/14 bg-brand-soft/60 px-3 py-1 text-xs font-semibold text-brand-ink">
                {filtered.length} of {cases.length} shown
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-2 text-xs font-semibold text-muted">
              <Sparkles className="size-4 text-accent" />
              {deferredSearch !== search ? "Updating results..." : "Live filtering"}
            </span>
            {hasActiveFilters ? (
              <Button
                onClick={() => {
                  setCaseType("ALL");
                  setSearch("");
                  setStatus("ALL");
                }}
                size="sm"
                variant="secondary"
              >
                Reset filters
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="w-full rounded-2xl border border-border bg-white px-12 py-3 outline-none ring-brand/25 focus:ring-4"
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search by student, verifier, country, or case id"
              value={search}
            />
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <select
              className="w-full appearance-none rounded-2xl border border-border bg-white px-12 py-3 outline-none"
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
          </label>
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <select
              className="w-full appearance-none rounded-2xl border border-border bg-white px-12 py-3 outline-none"
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
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip active={status !== "ALL"} label={status === "ALL" ? "Any status" : eventLabel(status as never)} />
          <FilterChip active={caseType !== "ALL"} label={caseType === "ALL" ? "Any case type" : CASE_TYPE_OPTIONS.find((item) => item.value === caseType)?.label ?? caseType} />
          <FilterChip active={search.trim().length > 0} label={search.trim().length > 0 ? `Search: ${search.trim()}` : "No keyword"} />
        </div>
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

function FilterChip({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold",
        active
          ? "border-brand/14 bg-brand-soft/65 text-brand-ink"
          : "border-border bg-white/70 text-muted",
      )}
    >
      {label}
    </span>
  );
}

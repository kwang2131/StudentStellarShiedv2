"use client";

import { ChevronsUpDown } from "lucide-react";

import { getRoleExperience } from "@/components/navigation";
import { ROLE_OPTIONS } from "@/lib/constants";
import { useWallet } from "@/components/providers/wallet-provider";

export function RoleSwitcher() {
  const { role, setRole } = useWallet();
  const experience = getRoleExperience(role);
  const RoleIcon = experience.icon;

  return (
    <label className="glass-panel min-w-[280px] rounded-[1.35rem] border border-white/80 px-4 py-3 text-sm">
      <span className="display-eyebrow text-[11px] text-muted">Active role</span>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
          <RoleIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{experience.label}</p>
          <p className="truncate text-xs text-muted">{experience.menuHint}</p>
        </div>
        <div className="relative">
          <select
            className="appearance-none rounded-full border border-border bg-white px-4 py-2 pr-9 font-semibold text-foreground outline-none ring-brand/20 transition focus:ring-4"
            onChange={(event) => setRole(event.currentTarget.value as typeof role)}
            value={role}
          >
            {ROLE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </div>
      </div>
    </label>
  );
}

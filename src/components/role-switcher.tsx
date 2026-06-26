"use client";

import { ROLE_OPTIONS } from "@/lib/constants";
import { useWallet } from "@/components/providers/wallet-provider";

export function RoleSwitcher() {
  const { role, setRole } = useWallet();

  return (
    <label className="flex items-center gap-3 rounded-full border border-border bg-white px-4 py-2 text-sm">
      <span className="font-medium text-muted">Role</span>
      <select
        className="bg-transparent font-semibold text-foreground outline-none"
        onChange={(event) => setRole(event.currentTarget.value as typeof role)}
        value={role}
      >
        {ROLE_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

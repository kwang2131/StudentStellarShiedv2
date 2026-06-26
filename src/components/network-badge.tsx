import { stellarConfig } from "@/lib/stellar/config";

export function NetworkBadge({
  network,
  mismatch = false,
}: {
  network?: string | null;
  mismatch?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        mismatch
          ? "border-danger/25 bg-danger/12 text-danger"
          : "border-brand/20 bg-brand-soft text-brand-strong"
      }`}
    >
      {network || stellarConfig.network}
    </span>
  );
}

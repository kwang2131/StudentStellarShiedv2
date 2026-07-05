import type { WalletProvider } from "@/types/study-bond";
import { providerLabel } from "@/lib/utils";

const providerColors: Partial<Record<WalletProvider, string>> = {
  FREIGHTER: "bg-brand text-white",
  RABET: "bg-[#0e3b60] text-white",
};

export function WalletProviderBadge({ provider }: { provider: WalletProvider }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${providerColors[provider] ?? "bg-muted/15 text-muted"}`}
    >
      {providerLabel(provider)}
    </span>
  );
}

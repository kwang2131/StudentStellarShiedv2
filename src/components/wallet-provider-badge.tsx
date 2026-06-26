import type { WalletProvider } from "@/types/study-bond";
import { providerLabel } from "@/lib/utils";

const providerColors: Record<WalletProvider, string> = {
  CLI: "bg-foreground text-background",
  FREIGHTER: "bg-brand text-white",
  MOCK: "bg-warning/15 text-warning",
  RABET: "bg-[#0e3b60] text-white",
};

export function WalletProviderBadge({ provider }: { provider: WalletProvider }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${providerColors[provider]}`}
    >
      {providerLabel(provider)}
    </span>
  );
}

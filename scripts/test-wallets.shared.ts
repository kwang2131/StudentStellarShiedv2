import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface WalletFixture {
  label: string;
  publicKey: string;
  suggestedRole:
    | "STUDENT"
    | "PARENT_GUARDIAN"
    | "INSTITUTION_VERIFIER"
    | "AGENCY"
    | "MEDIATOR"
    | "ADMIN"
    | "REVIEWER";
  funded?: boolean;
  balance?: string;
  lastInteraction?: string;
  lastTxHash?: string;
  walletProvider?: "FREIGHTER" | "RABET";
  usedInApp?: boolean;
}

export const TEST_WALLETS = [
  { label: "student-01", suggestedRole: "STUDENT" },
  { label: "student-02", suggestedRole: "STUDENT" },
  { label: "parent-01", suggestedRole: "PARENT_GUARDIAN" },
  { label: "school-01", suggestedRole: "INSTITUTION_VERIFIER" },
  { label: "dorm-01", suggestedRole: "INSTITUTION_VERIFIER" },
  { label: "landlord-01", suggestedRole: "INSTITUTION_VERIFIER" },
  { label: "agency-01", suggestedRole: "AGENCY" },
  { label: "verifier-01", suggestedRole: "INSTITUTION_VERIFIER" },
  { label: "admin-01", suggestedRole: "ADMIN" },
  { label: "mediator-01", suggestedRole: "MEDIATOR" },
  { label: "reviewer-01", suggestedRole: "REVIEWER" },
  { label: "reviewer-02", suggestedRole: "REVIEWER" },
] as const;

export const walletDataPath = path.join(process.cwd(), "data", "test-wallets.json");
const horizonUrl =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export function runStellarCommand(args: string[]) {
  return execFileSync("stellar", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export async function ensureWalletDataFile() {
  await mkdir(path.dirname(walletDataPath), { recursive: true });

  try {
    await readFile(walletDataPath, "utf8");
  } catch {
    await writeFile(walletDataPath, "[]\n", "utf8");
  }
}

export async function readWalletFixtures() {
  await ensureWalletDataFile();
  const raw = await readFile(walletDataPath, "utf8");
  return JSON.parse((raw || "[]").replace(/^\uFEFF/, "")) as WalletFixture[];
}

export async function writeWalletFixtures(wallets: WalletFixture[]) {
  await ensureWalletDataFile();
  await writeFile(walletDataPath, `${JSON.stringify(wallets, null, 2)}\n`, "utf8");
}

export async function fetchWalletSnapshot(publicKey: string) {
  const response = await fetch(`${horizonUrl}/accounts/${publicKey}`, { cache: "no-store" });

  if (!response.ok) {
    return {
      balance: "0",
      funded: false,
      lastTxHash: undefined,
    };
  }

  const account = (await response.json()) as {
    balances?: Array<{ asset_type: string; balance: string }>;
    last_modified_ledger?: number;
  };

  const txResponse = await fetch(`${horizonUrl}/accounts/${publicKey}/transactions?limit=1&order=desc`, {
    cache: "no-store",
  });

  const txPayload = txResponse.ok
    ? ((await txResponse.json()) as {
        _embedded?: { records?: Array<{ hash: string; created_at: string }> };
      })
    : null;

  return {
    balance:
      account.balances?.find((item) => item.asset_type === "native")?.balance ?? "0",
    funded: response.ok,
    lastInteraction: txPayload?._embedded?.records?.[0]?.created_at,
    lastTxHash: txPayload?._embedded?.records?.[0]?.hash,
  };
}

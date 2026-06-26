import { syncTestWalletsFromFile } from "../src/lib/server/test-wallets";
import {
  TEST_WALLETS,
  fetchWalletSnapshot,
  readWalletFixtures,
  runStellarCommand,
  writeWalletFixtures,
} from "./test-wallets.shared";

async function main() {
  const current = await readWalletFixtures();
  const next = [];

  for (const wallet of TEST_WALLETS) {
    const publicKey =
      current.find((item) => item.label === wallet.label)?.publicKey ??
      runStellarCommand(["keys", "public-key", wallet.label]);
    const snapshot = await fetchWalletSnapshot(publicKey);
    const existing = current.find((item) => item.label === wallet.label);

    next.push({
      label: wallet.label,
      publicKey,
      suggestedRole: wallet.suggestedRole,
      funded: snapshot.funded,
      balance: snapshot.balance,
      lastInteraction: snapshot.lastInteraction ?? existing?.lastInteraction,
      lastTxHash: snapshot.lastTxHash ?? existing?.lastTxHash,
      walletProvider: existing?.walletProvider ?? ("CLI" as const),
      usedInApp: existing?.usedInApp ?? false,
    });
  }

  await writeWalletFixtures(next);
  const synced = await syncTestWalletsFromFile();

  console.log(`Verified ${next.length} test wallets and synced ${synced} rows into Prisma.`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});

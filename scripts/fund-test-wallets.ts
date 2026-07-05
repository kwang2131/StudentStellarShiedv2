import { TEST_WALLETS, fetchWalletSnapshot, readWalletFixtures, runStellarCommand, writeWalletFixtures } from "./test-wallets.shared";

async function main() {
  const current = await readWalletFixtures();
  const next = [];

  for (const wallet of TEST_WALLETS) {
    runStellarCommand(["keys", "fund", wallet.label, "--network", "testnet"]);
    const publicKey = runStellarCommand(["keys", "public-key", wallet.label]);
    const snapshot = await fetchWalletSnapshot(publicKey);

    next.push({
      label: wallet.label,
      publicKey,
      suggestedRole: wallet.suggestedRole,
      funded: snapshot.funded,
      balance: snapshot.balance,
      lastInteraction: snapshot.lastInteraction,
      lastTxHash: snapshot.lastTxHash,
      walletProvider: "FREIGHTER" as const,
      usedInApp: current.find((item) => item.label === wallet.label)?.usedInApp ?? false,
    });
  }

  await writeWalletFixtures(next);

  console.log(`Funded and updated ${next.length} Stellar testnet wallets.`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});

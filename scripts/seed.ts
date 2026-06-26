import { prisma } from "../src/lib/prisma";
import { syncTestWalletsFromFile } from "../src/lib/server/test-wallets";

async function main() {
  await Promise.all([
    prisma.appSetting.upsert({
      where: { key: "liveDemoUrl" },
      update: { value: "" },
      create: { key: "liveDemoUrl", value: "" },
    }),
    prisma.appSetting.upsert({
      where: { key: "demoVideoUrl" },
      update: { value: "" },
      create: { key: "demoVideoUrl", value: "" },
    }),
    prisma.appSetting.upsert({
      where: { key: "contractDeployerPublicKey" },
      update: { value: "GCAJTVOW46RLLSOIDVXCV2KQUOC46ZWFNNJBFO3K4V72J5HWGXITQIV4" },
      create: {
        key: "contractDeployerPublicKey",
        value: "GCAJTVOW46RLLSOIDVXCV2KQUOC46ZWFNNJBFO3K4V72J5HWGXITQIV4",
      },
    }),
    prisma.appSetting.upsert({
      where: { key: "contractDeployTxHash" },
      update: { value: "6974a0a1604d0cfbf73977ad1094fdb40973ef4e6ffb0d4fe4c9ad0735fe0f47" },
      create: {
        key: "contractDeployTxHash",
        value: "6974a0a1604d0cfbf73977ad1094fdb40973ef4e6ffb0d4fe4c9ad0735fe0f47",
      },
    }),
    prisma.appSetting.upsert({
      where: { key: "contractInstallTxHash" },
      update: { value: "287a4f2b88696f2b1ebef5068b2c33490a254f0ec9b0a89c4a8ad37116787cc7" },
      create: {
        key: "contractInstallTxHash",
        value: "287a4f2b88696f2b1ebef5068b2c33490a254f0ec9b0a89c4a8ad37116787cc7",
      },
    }),
  ]);

  const syncedWallets = await syncTestWalletsFromFile();
  console.log(`Seeded app settings and synced ${syncedWallets} test wallets.`);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID = "CDUMMYCONTRACTID1234567890123456789012345678901234567890123";
process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL = "https://horizon-testnet.stellar.org";
process.env.NEXT_PUBLIC_STELLAR_NATIVE_ASSET_CONTRACT_ID =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
process.env.NEXT_PUBLIC_STELLAR_RPC_URL = "https://soroban-testnet.stellar.org";
process.env.DATABASE_URL ??= "postgresql://user:pass@localhost:5432/studybond";

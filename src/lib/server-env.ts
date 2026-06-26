import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  STELLAR_DEPLOYER_ALIAS: z.string().default("studybond-deployer"),
  STELLAR_SIMULATION_ACCOUNT: z.string().optional().default(""),
});

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  STELLAR_DEPLOYER_ALIAS: process.env.STELLAR_DEPLOYER_ALIAS,
  STELLAR_SIMULATION_ACCOUNT: process.env.STELLAR_SIMULATION_ACCOUNT,
});

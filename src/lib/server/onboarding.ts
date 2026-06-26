import "server-only";

import { prisma } from "@/lib/prisma";
import { onboardingSchema, type OnboardingInput } from "@/lib/server/validators";
import { trackEvent } from "@/lib/server/analytics";

export async function upsertOnboardingProfile(input: OnboardingInput) {
  const payload = onboardingSchema.parse(input);

  const user = await prisma.user.upsert({
    where: {
      walletAddress: payload.walletAddress,
    },
    update: {
      role: payload.role,
      name: payload.name,
      email: payload.email || null,
      walletProvider: payload.walletProvider,
      onboardingCompleted: true,
      targetCountry: payload.targetCountry,
      useCase: payload.useCase,
    },
    create: {
      role: payload.role,
      name: payload.name,
      email: payload.email || null,
      walletAddress: payload.walletAddress,
      walletProvider: payload.walletProvider,
      onboardingCompleted: true,
      targetCountry: payload.targetCountry,
      useCase: payload.useCase,
    },
  });

  await Promise.all([
    trackEvent({
      eventName: "ONBOARDING_STARTED",
      role: payload.role,
      walletAddress: payload.walletAddress,
      walletProvider: payload.walletProvider,
      path: "/onboarding",
    }),
    trackEvent({
      eventName: "WALLET_CONNECTED",
      role: payload.role,
      walletAddress: payload.walletAddress,
      walletProvider: payload.walletProvider,
      path: "/onboarding",
      metadata: {
        targetCountry: payload.targetCountry,
      },
    }),
  ]);

  return user;
}

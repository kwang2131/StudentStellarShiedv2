import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { eventLabel } from "@/lib/utils";
import type { AnalyticsPayloadInput } from "@/lib/server/validators";

export async function trackEvent(payload: AnalyticsPayloadInput) {
  return prisma.analyticsEvent.create({
    data: {
      eventName: payload.eventName,
      role: payload.role,
      walletAddress: payload.walletAddress,
      walletProvider: payload.walletProvider,
      path: payload.path,
      metadata: payload.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function getAnalyticsPageData() {
  const [events, walletInteractions, feedback] = await Promise.all([
    prisma.analyticsEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    }),
    prisma.walletInteraction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    }),
    prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    }),
  ]);

  const providerSplit = walletInteractions.reduce<Record<string, number>>(
    (accumulator, interaction) => {
      accumulator[interaction.walletProvider] =
        (accumulator[interaction.walletProvider] ?? 0) + 1;
      return accumulator;
    },
    {},
  );

  const eventCounts = events.reduce<Record<string, number>>((accumulator, event) => {
    accumulator[event.eventName] = (accumulator[event.eventName] ?? 0) + 1;
    return accumulator;
  }, {});

  const conversionFunnel = [
    {
      label: "Onboarding started",
      value: eventCounts.ONBOARDING_STARTED ?? 0,
    },
    {
      label: "Wallet connected",
      value: eventCounts.WALLET_CONNECTED ?? 0,
    },
    {
      label: "Case created",
      value: eventCounts.CASE_CREATED ?? 0,
    },
    {
      label: "Bond funded",
      value: eventCounts.BOND_FUNDED ?? 0,
    },
    {
      label: "Feedback submitted",
      value: eventCounts.FEEDBACK_SUBMITTED ?? 0,
    },
  ];

  return {
    summary: {
      pageViews: eventCounts.PAGE_VIEW ?? 0,
      walletConnects: eventCounts.WALLET_CONNECTED ?? 0,
      contractInteractions: walletInteractions.filter((item) => !!item.txHash).length,
      caseCreatedCount: eventCounts.CASE_CREATED ?? 0,
      bondFundedCount: eventCounts.BOND_FUNDED ?? 0,
      releaseRefundDisputeCount:
        (eventCounts.RELEASE_APPROVED ?? 0) +
        (eventCounts.REFUND_APPROVED ?? 0) +
        (eventCounts.DISPUTE_OPENED ?? 0) +
        (eventCounts.DISPUTE_RESOLVED ?? 0),
      feedbackSubmitted: feedback.length,
    },
    providerSplit,
    eventCounts: Object.entries(eventCounts).map(([eventName, value]) => ({
      eventName: eventLabel(eventName as never),
      value,
    })),
    conversionFunnel,
    recentEvents: events.slice(0, 20),
  };
}

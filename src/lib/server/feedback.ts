import { prisma } from "@/lib/prisma";
import { feedbackSchema, type FeedbackInput } from "@/lib/server/validators";
import { trackEvent } from "@/lib/server/analytics";

export async function createFeedback(input: FeedbackInput) {
  const payload = feedbackSchema.parse(input);

  const user = payload.walletAddress
    ? await prisma.user.findUnique({
        where: {
          walletAddress: payload.walletAddress,
        },
      })
    : null;

  const feedback = await prisma.feedback.create({
    data: {
      userId: user?.id,
      role: payload.role,
      walletAddress: payload.walletAddress || null,
      rating: payload.rating,
      workedWell: payload.workedWell,
      confusing: payload.confusing,
      wouldUse: payload.wouldUse,
      comment: payload.comment || null,
      contact: payload.contact || null,
    },
  });

  await trackEvent({
    eventName: "FEEDBACK_SUBMITTED",
    role: payload.role,
    walletAddress: payload.walletAddress || undefined,
    path: "/feedback",
  });

  return feedback;
}

export async function getFeedbackPageData() {
  const feedback = await prisma.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalResponses = feedback.length;
  const averageRating =
    totalResponses === 0
      ? 0
      : feedback.reduce((accumulator, item) => accumulator + item.rating, 0) /
        totalResponses;
  const wouldUsePercentage =
    totalResponses === 0
      ? 0
      : Math.round(
          (feedback.filter((item) => item.wouldUse).length / totalResponses) * 100,
        );

  return {
    summary: {
      totalResponses,
      averageRating,
      wouldUsePercentage,
      commonPositives: feedback.slice(0, 3).map((item) => item.workedWell),
      commonConfusionPoints: feedback.slice(0, 3).map((item) => item.confusing),
    },
    feedback,
  };
}

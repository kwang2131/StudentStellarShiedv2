import { FeedbackForm } from "@/components/feedback-form";
import { FeedbackSummary } from "@/components/feedback-summary";
import { PageIntro } from "@/components/page-intro";
import { getFeedbackPageData } from "@/lib/server/feedback";
import { serializeFeedback } from "@/lib/presenters";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const data = await getFeedbackPageData();

  return (
    <div className="space-y-6">
      <PageIntro
        description="Collect validation feedback separately from technical wallet proofs so product signals and protocol signals stay clearly separated."
        eyebrow="Feedback"
        title="Collect product validation feedback"
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FeedbackForm />
        <FeedbackSummary
          feedback={data.feedback.map(serializeFeedback)}
          summary={data.summary}
        />
      </div>
    </div>
  );
}

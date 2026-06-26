import { createFeedback, getFeedbackPageData } from "@/lib/server/feedback";
import { serializeFeedback } from "@/lib/presenters";
import { feedbackSchema } from "@/lib/server/validators";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getFeedbackPageData();
    return Response.json({
      feedback: data.feedback.map(serializeFeedback),
      summary: data.summary,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = feedbackSchema.parse(await request.json());
    const feedback = await createFeedback(body);

    return Response.json({
      feedback: serializeFeedback(feedback),
    });
  } catch (error) {
    return jsonError(error);
  }
}

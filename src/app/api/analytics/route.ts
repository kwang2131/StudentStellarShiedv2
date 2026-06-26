import { trackEvent } from "@/lib/server/analytics";
import { analyticsPayloadSchema } from "@/lib/server/validators";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = analyticsPayloadSchema.parse(await request.json());
    const event = await trackEvent(body);

    return Response.json({ event });
  } catch (error) {
    return jsonError(error);
  }
}

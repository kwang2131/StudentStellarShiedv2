import { upsertOnboardingProfile } from "@/lib/server/onboarding";
import { onboardingSchema } from "@/lib/server/validators";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = onboardingSchema.parse(await request.json());
    const user = await upsertOnboardingProfile(body);

    return Response.json({ user });
  } catch (error) {
    return jsonError(error);
  }
}

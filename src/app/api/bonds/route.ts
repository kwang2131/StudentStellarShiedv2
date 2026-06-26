import { createBondCase, listBondCases } from "@/lib/server/bonds";
import { serializeBondCase } from "@/lib/presenters";
import { bondFiltersSchema, createBondSchema } from "@/lib/server/validators";
import { jsonError } from "@/lib/route-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = bondFiltersSchema.parse({
      caseType: url.searchParams.get("caseType") || undefined,
      search: url.searchParams.get("search") || undefined,
      status: url.searchParams.get("status") || undefined,
    });
    const cases = await listBondCases(filters);

    return Response.json({
      cases: cases.map(serializeBondCase),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createBondSchema.parse(await request.json());
    const bondCase = await createBondCase(body);

    return Response.json({
      bondCase: serializeBondCase(bondCase),
    });
  } catch (error) {
    return jsonError(error);
  }
}

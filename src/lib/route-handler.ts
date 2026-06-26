import { ZodError } from "zod";

export function jsonError(error: unknown, status = 500) {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: error.issues[0]?.message || "Invalid request payload.",
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    return Response.json(
      {
        error: error.message,
      },
      { status },
    );
  }

  return Response.json(
    {
      error: "Unexpected error.",
    },
    { status },
  );
}

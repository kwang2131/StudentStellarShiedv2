export const dynamic = "force-dynamic";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Healthcheck timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export async function GET() {
  try {
    await withTimeout(
      (async () => {
        const { prisma } = await import("@/lib/prisma");
        await prisma.$queryRaw`SELECT 1`;
      })(),
      5_000,
    );

    return Response.json(
      {
        database: "ok",
        status: "ok",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Healthcheck failed.";

    return Response.json(
      {
        database: "degraded",
        message,
        status: "degraded",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}

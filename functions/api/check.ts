// Cloudflare Pages Function: /api/check
// Verifies if the visitor's IP has received a genuine OGAds conversion postback

declare global {
  var __completedIps: Map<string, { count: number; timestamp: number }> | undefined;
}

if (!globalThis.__completedIps) {
  globalThis.__completedIps = new Map();
}

export async function onRequest(context: any): Promise<Response> {
  const request: Request = context.request;
  const url = new URL(request.url);

  // Client can pass their identified IP or rely on header
  const ip =
    url.searchParams.get('ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '';

  let completed = false;
  let count = 0;

  if (ip) {
    const memoryRecord = globalThis.__completedIps!.get(ip);
    if (memoryRecord && memoryRecord.count > 0) {
      completed = true;
      count = memoryRecord.count;
    } else if (context.env?.LOCKER_KV) {
      try {
        const kvRaw = await context.env.LOCKER_KV.get(`completed:${ip}`);
        if (kvRaw) {
          const parsed = JSON.parse(kvRaw);
          if (parsed && parsed.count > 0) {
            completed = true;
            count = parsed.count;
          }
        }
      } catch (err) {
        console.warn('[Check KV Error]:', err);
      }
    }
  }

  return new Response(
    JSON.stringify({
      completed,
      count,
      ip,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

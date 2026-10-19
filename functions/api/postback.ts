// Cloudflare Pages Function: /api/postback
// Receives conversion pings from OGAds (directly or relayed via cine4life.ai.studio)

// Global memory registry across worker isolate requests
declare global {
  var __completedIps: Map<string, { count: number; timestamp: number }> | undefined;
}

if (!globalThis.__completedIps) {
  globalThis.__completedIps = new Map();
}

export async function onRequest(context: any): Promise<Response> {
  const request: Request = context.request;
  const url = new URL(request.url);

  // Extract IP and conversion metadata from query or body
  const ip =
    url.searchParams.get('ip') ||
    url.searchParams.get('session_ip') ||
    url.searchParams.get('aff_sub5') ||
    request.headers.get('cf-connecting-ip') ||
    '';

  const offerId = url.searchParams.get('offer_id') || url.searchParams.get('offerid') || 'unknown';
  const payout = url.searchParams.get('payout') || '0';
  const site = url.searchParams.get('site') || url.searchParams.get('aff_sub4') || url.searchParams.get('aff_sub') || '';

  if (ip) {
    const existing = globalThis.__completedIps!.get(ip) || { count: 0, timestamp: Date.now() };
    existing.count += 1;
    existing.timestamp = Date.now();
    globalThis.__completedIps!.set(ip, existing);

    console.log(`[Postback Confirmed] IP: ${ip} | Offer: ${offerId} | Payout: ${payout} | Total conversions: ${existing.count}`);

    // If Cloudflare KV is bound as context.env.LOCKER_KV, persist there as well
    if (context.env?.LOCKER_KV) {
      try {
        await context.env.LOCKER_KV.put(
          `completed:${ip}`,
          JSON.stringify({ count: existing.count, timestamp: Date.now() }),
          { expirationTtl: 86400 } // 24 hours
        );
      } catch (kvErr) {
        console.warn('[Postback KV Error]:', kvErr);
      }
    }
  }

  return new Response('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

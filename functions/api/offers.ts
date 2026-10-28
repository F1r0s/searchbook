// Cloudflare Pages Function: /api/offers
// Proxies requests to OGAds API v2, sorts boosted first and highest payout, attaches sub-tracking IDs

const OGADS_API_ENDPOINT = 'https://appcomplete.org/api/v2';
const OGADS_BEARER_TOKEN = '47558|DluqLUTirEcifKUEHLp0wrBpqTebJR7XbTqwtkL666b7e813';
const SITE_IDENTIFIER = 'readbook';

export async function onRequest(context: any): Promise<Response> {
  const request: Request = context.request;

  // Extract client IP & User Agent
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '1.1.1.1';

  const userAgent = request.headers.get('user-agent') || 'Mozilla/5.0';

  const targetUrl = new URL(OGADS_API_ENDPOINT);
  targetUrl.searchParams.set('ip', clientIp);
  targetUrl.searchParams.set('user_agent', userAgent);
  targetUrl.searchParams.set('max', '50');

  try {
    const apiRes = await fetch(targetUrl.toString(), {
      headers: {
        Authorization: `Bearer ${OGADS_BEARER_TOKEN}`,
        'User-Agent': userAgent,
      },
    });

    if (!apiRes.ok) {
      throw new Error(`OGAds API responded with status ${apiRes.status}`);
    }

    const data: any = await apiRes.json();
    const rawOffers: any[] = data.offers || data.data || [];

    // Prioritize boosted offers first, then sort by payout descending
    const sorted = [...rawOffers].sort((a, b) => {
      const aBoost = a.boosted ? 1 : 0;
      const bBoost = b.boosted ? 1 : 0;
      if (bBoost !== aBoost) return bBoost - aBoost;

      const aPayout = parseFloat(a.payout) || 0;
      const bPayout = parseFloat(b.payout) || 0;
      return bPayout - aPayout;
    });

    // Select the top 2 highest-performing offers
    const topOffers = sorted.slice(0, 2).map((offer, index) => {
      // Append multi-site routing and user tracking parameters
      const trackingDelimiter = offer.link.includes('?') ? '&' : '?';
      const trackingLink = `${offer.link}${trackingDelimiter}aff_sub=${SITE_IDENTIFIER}&aff_sub4=${SITE_IDENTIFIER}&aff_sub5=${encodeURIComponent(clientIp)}`;

      return {
        id: offer.offerid || offer.id || `offer-${index}`,
        name: offer.name_short || offer.name || 'Quick Activity',
        description: offer.adcopy || offer.description || 'Complete this short activity to unlock full digital access.',
        image: offer.picture || offer.wide_image || '',
        link: trackingLink,
        payout: offer.payout || '1.00',
        boosted: Boolean(offer.boosted),
        badge: index === 0 ? '⚡ Fastest Unlock' : '★ Most Popular',
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        userIp: clientIp,
        offers: topOffers,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('[OGAds Proxy Error]:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch offers',
        userIp: clientIp,
        offers: [],
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

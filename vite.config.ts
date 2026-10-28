import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function autoSitemapGeneratorPlugin(): Plugin {
  return {
    name: 'auto-sitemap-generator',
    buildStart() {
      try {
        execSync('node scripts/generate-sitemaps.mjs', { stdio: 'inherit' });
      } catch (err) {
        console.warn('[Sitemap Plugin] Skipped buildStart generation:', err);
      }
    },
  };
}

function autoSitemapGeneratorPlugin(): Plugin {
  return {
    name: 'auto-sitemap-generator',
    buildStart() {
      try {
        execSync('node scripts/generate-sitemaps.mjs', { stdio: 'inherit' });
      } catch (err) {
        console.warn('[Sitemap Plugin] Skipped buildStart generation:', err);
      }
    },
  };
}

function ogadsDevApiPlugin(): Plugin {
  const completedIps = new Map<string, { count: number; timestamp: number }>();

  return {
    name: 'ogads-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost:3000'}`);

        if (url.pathname === '/api/offers') {
          try {
            const rawClientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
            const clientIp = rawClientIp && rawClientIp !== '::1' && rawClientIp !== '127.0.0.1' ? rawClientIp : '1.1.1.1';
            const ua = (req.headers['user-agent'] as string) || 'Mozilla/5.0';

            const apiUrl = `https://appcomplete.org/api/v2?ip=${encodeURIComponent(clientIp)}&user_agent=${encodeURIComponent(ua)}&max=50`;
            const apiRes = await fetch(apiUrl, {
              headers: {
                Authorization: 'Bearer 47558|DluqLUTirEcifKUEHLp0wrBpqTebJR7XbTqwtkL666b7e813',
              },
            });

            const data: any = await apiRes.json();
            const rawOffers: any[] = data.offers || data.data || [];

            const sorted = [...rawOffers].sort((a, b) => {
              const aBoost = a.boosted ? 1 : 0;
              const bBoost = b.boosted ? 1 : 0;
              if (bBoost !== aBoost) return bBoost - aBoost;
              return (parseFloat(b.payout) || 0) - (parseFloat(a.payout) || 0);
            });

            const topOffers = sorted.slice(0, 2).map((offer, index) => {
              const delim = offer.link.includes('?') ? '&' : '?';
              const trackingLink = `${offer.link}${delim}aff_sub=readbook&aff_sub4=readbook&aff_sub5=${encodeURIComponent(clientIp)}`;
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

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, userIp: clientIp, offers: topOffers }));
            return;
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message, offers: [] }));
            return;
          }
        }

        if (url.pathname === '/api/postback') {
          const ip =
            url.searchParams.get('ip') ||
            url.searchParams.get('session_ip') ||
            url.searchParams.get('aff_sub5') ||
            '1.1.1.1';

          const existing = completedIps.get(ip) || { count: 0, timestamp: Date.now() };
          existing.count += 1;
          existing.timestamp = Date.now();
          completedIps.set(ip, existing);

          res.setHeader('Content-Type', 'text/plain');
          res.end('OK');
          return;
        }

        if (url.pathname === '/api/check') {
          const rawIp = url.searchParams.get('ip') || '';
          const ip = rawIp && rawIp !== '::1' && rawIp !== '127.0.0.1' ? rawIp : '1.1.1.1';
          const record = completedIps.get(ip);
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              completed: Boolean(record && record.count > 0),
              count: record?.count || 0,
              ip,
            })
          );
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [autoSitemapGeneratorPlugin(), react(), tailwindcss(), ogadsDevApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    define: {
      'process.env': {},
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});

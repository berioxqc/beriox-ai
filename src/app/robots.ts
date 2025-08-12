import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/blog',
          '/pricing',
          '/features-demo',
          '/competitors',
          '/form-optimization',
          '/privacy',
          '/cookies',
        ],
        disallow: [
          '/admin',
          '/api',
          '/auth',
          '/_next',
          '/super-admin',
          '/missions',
          '/profile',
          '/settings',
          '/time-tracking',
          '/bots',
          '/agents',
          '/integrations',
          '/onboarding',
          '/welcome',
          '/coupon',
          '/refunds',
          '/recommendations',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 2,
      },
    ],
    sitemap: 'https://beriox-ai.vercel.app/sitemap.xml',
  };
}

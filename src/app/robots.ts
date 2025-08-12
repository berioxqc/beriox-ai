import { MetadataRoute } from 'apos;next'apos;;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'apos;*'apos;,
        allow: [
          'apos;/'apos;,
          'apos;/blog'apos;,
          'apos;/pricing'apos;,
          'apos;/features-demo'apos;,
          'apos;/competitors'apos;,
          'apos;/form-optimization'apos;,
          'apos;/privacy'apos;,
          'apos;/cookies'apos;,
        ],
        disallow: [
          'apos;/admin'apos;,
          'apos;/api'apos;,
          'apos;/auth'apos;,
          'apos;/_next'apos;,
          'apos;/super-admin'apos;,
          'apos;/missions'apos;,
          'apos;/profile'apos;,
          'apos;/settings'apos;,
          'apos;/time-tracking'apos;,
          'apos;/bots'apos;,
          'apos;/agents'apos;,
          'apos;/integrations'apos;,
          'apos;/onboarding'apos;,
          'apos;/welcome'apos;,
          'apos;/coupon'apos;,
          'apos;/refunds'apos;,
          'apos;/recommendations'apos;,
        ],
      },
      {
        userAgent: 'apos;Googlebot'apos;,
        allow: 'apos;/'apos;,
        crawlDelay: 1,
      },
      {
        userAgent: 'apos;Bingbot'apos;,
        allow: 'apos;/'apos;,
        crawlDelay: 2,
      },
    ],
    sitemap: 'apos;https://beriox-ai.vercel.app/sitemap.xml'apos;,
  };
}

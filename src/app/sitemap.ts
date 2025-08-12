import { MetadataRoute } from 'apos;next'apos;;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'apos;https://beriox-ai.vercel.app'apos;;
  
  // Pages statiques principales
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'apos;daily'apos; as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'apos;weekly'apos; as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'apos;monthly'apos; as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features-demo`,
      lastModified: new Date(),
      changeFrequency: 'apos;monthly'apos; as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/competitors`,
      lastModified: new Date(),
      changeFrequency: 'apos;monthly'apos; as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/form-optimization`,
      lastModified: new Date(),
      changeFrequency: 'apos;monthly'apos; as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai-automation-guide`,
      lastModified: new Date(),
      changeFrequency: 'apos;monthly'apos; as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/beriox-vs-competitors`,
      lastModified: new Date(),
      changeFrequency: 'apos;monthly'apos; as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/start-free-trial`,
      lastModified: new Date(),
      changeFrequency: 'apos;daily'apos; as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'apos;yearly'apos; as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'apos;yearly'apos; as const,
      priority: 0.3,
    },
  ];

  // Articles de blog
  const blogPosts = [
    {
      id: 'apos;ia-automatisation-2024'apos;,
      title: 'apos;L\'apos;IA d\'apos;Automatisation en 2024 : Tendances et Opportunités'apos;,
      publishedAt: 'apos;2024-01-15'apos;,
    },
    {
      id: 'apos;agents-ia-productivite'apos;,
      title: 'apos;Comment les Agents IA Transforment la Productivité'apos;,
      publishedAt: 'apos;2024-01-10'apos;,
    },
    {
      id: 'apos;orchestration-ia-avancee'apos;,
      title: 'apos;L\'apos;Orchestration IA Avancée : Au-delà de l\'apos;Automatisation Simple'apos;,
      publishedAt: 'apos;2024-01-05'apos;,
    },
    {
      id: 'apos;seo-ia-2024'apos;,
      title: 'apos;SEO et IA en 2024 : Stratégies Gagnantes'apos;,
      publishedAt: 'apos;2024-01-01'apos;,
    },
  ];

  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'apos;monthly'apos; as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}

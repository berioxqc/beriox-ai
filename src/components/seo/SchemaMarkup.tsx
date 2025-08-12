import Script from 'next/script';

interface SchemaMarkupProps {
  type: 'organization' | 'website' | 'article' | 'product' | 'breadcrumb';
  data: any;
}

export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const getSchema = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Beriox AI',
          url: 'https://beriox-ai.vercel.app',
          logo: 'https://beriox-ai.vercel.app/logo.png',
          description: 'Plateforme d\'intelligence artificielle pour l\'automatisation et l\'orchestration d\'agents IA',
          sameAs: [
            'https://twitter.com/berioxai',
            'https://linkedin.com/company/beriox-ai',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'contact@beriox-ai.com',
          },
        };

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Beriox AI',
          url: 'https://beriox-ai.vercel.app',
          description: 'Plateforme d\'intelligence artificielle pour l\'automatisation et l\'orchestration d\'agents IA',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://beriox-ai.vercel.app/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        };

      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.excerpt,
          image: data.image,
          author: {
            '@type': 'Organization',
            name: 'Beriox AI',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Beriox AI',
            logo: {
              '@type': 'ImageObject',
              url: 'https://beriox-ai.vercel.app/logo.png',
            },
          },
          datePublished: data.publishedAt,
          dateModified: data.publishedAt,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://beriox-ai.vercel.app/blog/${data.id}`,
          },
        };

      case 'product':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Beriox AI Platform',
          description: 'Plateforme d\'intelligence artificielle pour l\'automatisation et l\'orchestration d\'agents IA',
          url: 'https://beriox-ai.vercel.app',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Version gratuite disponible',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '127',
          },
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };

      default:
        return null;
    }
  };

  const schema = getSchema();
  if (!schema) return null;

  return (
    <Script
      id={`schema-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

import Script from 'apos;next/script'apos;;

interface SchemaMarkupProps {
  type: 'apos;organization'apos; | 'apos;website'apos; | 'apos;article'apos; | 'apos;product'apos; | 'apos;breadcrumb'apos;;
  data: any;
}

export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const getSchema = () => {
    switch (type) {
      case 'apos;organization'apos;:
        return {
          'apos;@context'apos;: 'apos;https://schema.org'apos;,
          'apos;@type'apos;: 'apos;Organization'apos;,
          name: 'apos;Beriox AI'apos;,
          url: 'apos;https://beriox-ai.vercel.app'apos;,
          logo: 'apos;https://beriox-ai.vercel.app/logo.png'apos;,
          description: 'apos;Plateforme d\'apos;intelligence artificielle pour l\'apos;automatisation et l\'apos;orchestration d\'apos;agents IA'apos;,
          sameAs: [
            'apos;https://twitter.com/berioxai'apos;,
            'apos;https://linkedin.com/company/beriox-ai'apos;,
          ],
          contactPoint: {
            'apos;@type'apos;: 'apos;ContactPoint'apos;,
            contactType: 'apos;customer service'apos;,
            email: 'apos;contact@beriox-ai.com'apos;,
          },
        };

      case 'apos;website'apos;:
        return {
          'apos;@context'apos;: 'apos;https://schema.org'apos;,
          'apos;@type'apos;: 'apos;WebSite'apos;,
          name: 'apos;Beriox AI'apos;,
          url: 'apos;https://beriox-ai.vercel.app'apos;,
          description: 'apos;Plateforme d\'apos;intelligence artificielle pour l\'apos;automatisation et l\'apos;orchestration d\'apos;agents IA'apos;,
          potentialAction: {
            'apos;@type'apos;: 'apos;SearchAction'apos;,
            target: 'apos;https://beriox-ai.vercel.app/search?q={search_term_string}'apos;,
            'apos;query-input'apos;: 'apos;required name=search_term_string'apos;,
          },
        };

      case 'apos;article'apos;:
        return {
          'apos;@context'apos;: 'apos;https://schema.org'apos;,
          'apos;@type'apos;: 'apos;Article'apos;,
          headline: data.title,
          description: data.excerpt,
          image: data.image,
          author: {
            'apos;@type'apos;: 'apos;Organization'apos;,
            name: 'apos;Beriox AI'apos;,
          },
          publisher: {
            'apos;@type'apos;: 'apos;Organization'apos;,
            name: 'apos;Beriox AI'apos;,
            logo: {
              'apos;@type'apos;: 'apos;ImageObject'apos;,
              url: 'apos;https://beriox-ai.vercel.app/logo.png'apos;,
            },
          },
          datePublished: data.publishedAt,
          dateModified: data.publishedAt,
          mainEntityOfPage: {
            'apos;@type'apos;: 'apos;WebPage'apos;,
            'apos;@id'apos;: `https://beriox-ai.vercel.app/blog/${data.id}`,
          },
        };

      case 'apos;product'apos;:
        return {
          'apos;@context'apos;: 'apos;https://schema.org'apos;,
          'apos;@type'apos;: 'apos;SoftwareApplication'apos;,
          name: 'apos;Beriox AI Platform'apos;,
          description: 'apos;Plateforme d\'apos;intelligence artificielle pour l\'apos;automatisation et l\'apos;orchestration d\'apos;agents IA'apos;,
          url: 'apos;https://beriox-ai.vercel.app'apos;,
          applicationCategory: 'apos;BusinessApplication'apos;,
          operatingSystem: 'apos;Web Browser'apos;,
          offers: {
            'apos;@type'apos;: 'apos;Offer'apos;,
            price: 'apos;0'apos;,
            priceCurrency: 'apos;USD'apos;,
            description: 'apos;Version gratuite disponible'apos;,
          },
          aggregateRating: {
            'apos;@type'apos;: 'apos;AggregateRating'apos;,
            ratingValue: 'apos;4.8'apos;,
            ratingCount: 'apos;127'apos;,
          },
        };

      case 'apos;breadcrumb'apos;:
        return {
          'apos;@context'apos;: 'apos;https://schema.org'apos;,
          'apos;@type'apos;: 'apos;BreadcrumbList'apos;,
          itemListElement: data.items.map((item: any, index: number) => ({
            'apos;@type'apos;: 'apos;ListItem'apos;,
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

interface JsonLdProps {
  type: 'WebSite' | 'WebApplication' | 'Organization';
}

export function generateJsonLd(type: JsonLdProps['type']): string {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
  
  const schemas: Record<JsonLdProps['type'], object> = {
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'ScamGuard',
      'description': 'Платформа для анализа и обнаружения мошеннического контента с помощью искусственного интеллекта',
      'url': baseUrl,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${baseUrl}/dashboard?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },
    WebApplication: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'ScamGuard AI',
      'applicationCategory': 'SecurityApplication',
      'operatingSystem': 'Web',
      'description': 'Проверка текстов, изображений, видео и URL на мошеннический контент с точностью более 95%',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'RUB'
      }
    },
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'ScamGuard',
      'description': 'Защита от мошенничества в интернете',
      'url': baseUrl,
      'logo': `${baseUrl}/vite.svg`,
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer support',
        'email': 'support@scamguard.example'
      }
    }
  };

  return JSON.stringify(schemas[type]);
}

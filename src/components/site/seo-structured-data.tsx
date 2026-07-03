'use client';

import { brands, contactInfo, services } from '@/lib/data';

export default function SEOStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Urbanización La Pampa",
    "image": "https://urbanizacionlapampa.com/hero.png",
    "@id": "https://urbanizacionlapampa.com",
    "url": "https://urbanizacionlapampa.com",
    "telephone": contactInfo.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Principal del Bosque, Lote 1",
      "addressLocality": "La Pampa",
      "addressRegion": "Madrid",
      "postalCode": "28001",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.416775,
      "longitude": -3.703790
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios Residenciales Premium",
      "itemListElement": services.map((service) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.title,
          "description": service.description
        }
      }))
    }
  };

  const brandsData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Urbanización La Pampa",
    "knowsAbout": [
      ...brands,
      "Barrio Cerrado de Lujo",
      "Seguridad Residencial de Alta Gama",
      "Wellness & Club House"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandsData) }}
      />
    </>
  );
}

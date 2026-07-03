'use client';

import { brands, contactInfo, services } from '@/lib/data';

export default function SEOStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
    "name": "Centro de Bienestar La Pampa | El Mejor Santuario Wellness",
    "description": "Centro comercial independiente de ultra-lujo enfocado en disciplinas wellness y bienestar físico-mental.",
    "image": "https://lapampawellness.com/hero.png",
    "@id": "https://lapampawellness.com",
    "url": "https://lapampawellness.com",
    "telephone": contactInfo.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Principal del Bosque, Edificio Wellness",
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
    "sameAs": [
      "https://lapampawellness.com/portal"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios Wellness de Ultra-Lujo",
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
    "name": "Centro de Bienestar La Pampa",
    "slogan": "El Mejor Santuario Wellness",
    "knowsAbout": [
      ...brands,
      "Centro Wellness Premium",
      "Disciplinas Holisticas y Fitness",
      "Wellness & Spa 5 Estrellas",
      "El Mejor Centro de Bienestar"
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

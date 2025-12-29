import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
  breadcrumbs?: { name: string, item: string }[];
}

export const SEOHelmet: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  schema,
  breadcrumbs
}) => {
  const siteTitle = 'Wanderlust';
  const fullTitle = `${title} | ${siteTitle}`;
  const defaultImage = 'https://wanderlust.app/og-image.jpg'; // Placeholder or import a real one

  // Construct JSON-LD
  const schemas = [];
  if (schema) schemas.push(schema);
  if (breadcrumbs) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": `https://wanderlust.app${crumb.item}`
      }))
    });
  }

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {!image && <meta property="og:image" content={defaultImage} />}
      {url && <meta property="og:url" content={url} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {!image && <meta name="twitter:image" content={defaultImage} />}

      {/* JSON-LD */}
      {schemas.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(schemas)}
        </script>
      )}
    </Helmet>
  );
};

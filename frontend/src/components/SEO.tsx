import { Helmet } from "react-helmet-async";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  PRIMARY_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string[];
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const SEO = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  keywords = [...PRIMARY_KEYWORDS],
  noIndex = false,
  structuredData,
}: SEOProps) => {
  const fullTitle =
    title.includes(SITE_NAME) || title.length > 55
      ? title
      : `${title} | ${SITE_NAME}`;
  const pageUrl = absoluteUrl(
    canonical ||
      (typeof window !== "undefined" ? window.location.pathname : "/"),
  );
  const imageUrl = absoluteUrl(ogImage);
  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <html lang="en-CA" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="author" content={SITE_NAME} />
      <meta name="theme-color" content="#12213E" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="geo.region" content="CA" />
      <meta name="geo.placename" content="Canada" />
      <link rel="canonical" href={pageUrl} />

      {/* Favicons: circular bordered logo */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
      <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Open Graph */}
      <meta property="og:locale" content="en_CA" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={`${SITE_NAME} logo`} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      {schemas.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}

      {/* Keep SITE_URL discoverable for crawlers that read comments poorly: unused but validates build */}
      <meta name="msapplication-TileColor" content="#12213E" />
      <link rel="alternate" hrefLang="en-CA" href={pageUrl} />
      <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
    </Helmet>
  );
};

export default SEO;

/** Canonical production origin for absolute SEO URLs. */
export const SITE_URL = "https://firststepwealthgroup.ca";
export const SITE_NAME = "First Step Wealth Group";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/fswgLogo.jpg`;
export const TWITTER_HANDLE = "@firststepwealth";

/** Core topical keywords: used as meta keywords + content guidance. */
export const PRIMARY_KEYWORDS = [
  "rental guarantee Canada",
  "housing for newcomers Canada",
  "rent without Canadian credit",
  "real estate support Canada",
  "first-time home buyer Canada",
  "mortgage guidance newcomers",
  "insurance advisor Canada",
  "wealth building for immigrants",
  "financial education Canada",
  "First Step Wealth Group",
] as const;

export function absoluteUrl(pathOrUrl = "/"): string {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "FinancialService", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["FSWG", "First Step Wealth"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/fswgLogo.jpg`,
    description:
      "First Step Wealth Group helps newcomers and families in Canada with rental guarantees, insurance advisory, wealth education, and real estate support.",
    foundingDate: "2020",
    areaServed: {
      "@type": "Country",
      name: "Canada",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "CA",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+1-905-519-2873",
        contactType: "customer service",
        areaServed: "CA",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [],
    knowsAbout: [
      "Rental guarantee",
      "Housing for newcomers",
      "Canadian credit building",
      "Life and health insurance",
      "Wealth education",
      "Real estate support",
      "Mortgage guidance",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "Rental guarantees, insurance, wealth planning, and real estate support for newcomers to Canada.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-CA",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.serviceType,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Canada" },
  };
}

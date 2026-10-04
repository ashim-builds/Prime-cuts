import React, { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  schema?: Record<string, any>;
}

const DEFAULT_TITLE = "Prime Cuts Butcher House | Fresh, Clean & Quality Meat | Pokhara, Nepal";
const DEFAULT_DESCRIPTION = "Prime Cuts Butcher House at Khudi Chowk, Pokhara-30. Order 100% fresh Khasi (खसीको मासु), Boka, Broiler Chicken, Giriraj Local Chicken, Momos, Sausages & Farm Eggs. Fast doorstep delivery across Pokhara.";
const DEFAULT_IMAGE = "https://primecuts.com.np/icon-512x512.png";
const BASE_URL = "https://primecuts.com.np";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  schema,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | Prime Cuts Butcher House Pokhara`
    : DEFAULT_TITLE;

  const currentUrl = url ? (url.startsWith("http") ? url : `${BASE_URL}${url}`) : window.location.href;

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // 2. Update Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute("content", description);

    // 3. Update Keywords if provided
    if (keywords) {
      let kwMeta = document.querySelector('meta[name="keywords"]');
      if (!kwMeta) {
        kwMeta = document.createElement("meta");
        kwMeta.setAttribute("name", "keywords");
        document.head.appendChild(kwMeta);
      }
      kwMeta.setAttribute("content", keywords);
    }

    // 4. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", currentUrl);

    // 5. Update Open Graph Meta
    const ogTags: Record<string, string> = {
      "og:title": fullTitle,
      "og:description": description,
      "og:image": image,
      "og:url": currentUrl,
      "og:type": type,
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // 6. Update Twitter Card Meta
    const twitterTags: Record<string, string> = {
      "twitter:title": fullTitle,
      "twitter:description": description,
      "twitter:image": image,
      "twitter:url": currentUrl,
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // 7. Inject Dynamic Schema JSON-LD if provided
    let scriptElem: HTMLScriptElement | null = null;
    if (schema) {
      scriptElem = document.createElement("script");
      scriptElem.type = "application/ld+json";
      scriptElem.text = JSON.stringify(schema);
      scriptElem.setAttribute("data-dynamic-seo", "true");
      document.head.appendChild(scriptElem);
    }

    return () => {
      if (scriptElem && scriptElem.parentNode) {
        scriptElem.parentNode.removeChild(scriptElem);
      }
    };
  }, [fullTitle, description, keywords, image, currentUrl, type, schema]);

  return null;
}

import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.elunoracrafts.com';
const SITE_NAME = 'ELUNORA';
const DEFAULT_IMAGE = `${SITE_URL}/instagram/images/insta-profile-icon.jpeg`;
const TWITTER_HANDLE = '@elunoracrafts';

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  schema?: object | object[];
  keywords?: string;
  canonical?: string;
}

const upsertMeta = (selector: string, attrs: Record<string, string>, value: string) => {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

export const SEOHead = ({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  schema,
  keywords,
  canonical: canonicalProp,
}: SEOProps) => {
  const { pathname } = useLocation();
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonical = canonicalProp ?? `${SITE_URL}${pathname}`;
  const schemaStr = useMemo(() => schema ? JSON.stringify(schema) : null, [schema]);

  useEffect(() => {
    document.title = fullTitle;

    const robots = noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

    upsertMeta('meta[name="description"]',           { name: 'description' },           description);
    upsertMeta('meta[name="robots"]',                { name: 'robots' },                robots);
    upsertMeta('meta[name="twitter:card"]',          { name: 'twitter:card' },          'summary_large_image');
    upsertMeta('meta[name="twitter:site"]',          { name: 'twitter:site' },          TWITTER_HANDLE);
    upsertMeta('meta[name="twitter:title"]',         { name: 'twitter:title' },         fullTitle);
    upsertMeta('meta[name="twitter:description"]',   { name: 'twitter:description' },   description);
    upsertMeta('meta[name="twitter:image"]',         { name: 'twitter:image' },         image);
    upsertMeta('meta[property="og:title"]',          { property: 'og:title' },          fullTitle);
    upsertMeta('meta[property="og:description"]',    { property: 'og:description' },    description);
    upsertMeta('meta[property="og:image"]',          { property: 'og:image' },          image);
    upsertMeta('meta[property="og:type"]',           { property: 'og:type' },           type);
    upsertMeta('meta[property="og:url"]',            { property: 'og:url' },            canonical);
    upsertMeta('meta[property="og:site_name"]',      { property: 'og:site_name' },      SITE_NAME);
    upsertMeta('meta[property="og:locale"]',         { property: 'og:locale' },         'en_IN');

    if (keywords) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords' }, keywords);
    }

    // Canonical
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    // JSON-LD schema (page-specific)
    document.getElementById('page-schema')?.remove();
    if (schemaStr) {
      const script = document.createElement('script');
      script.id = 'page-schema';
      script.type = 'application/ld+json';
      script.text = schemaStr;
      document.head.appendChild(script);
    }

    return () => { document.getElementById('page-schema')?.remove(); };
  }, [fullTitle, description, image, type, noIndex, canonical, keywords, schemaStr]);

  return null;
};

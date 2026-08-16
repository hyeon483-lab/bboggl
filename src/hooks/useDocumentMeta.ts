import { useEffect } from 'react';

interface DocumentMetaOptions {
  title: string;
  description?: string;
  noindex?: boolean;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function removeMetaTag(attr: 'name' | 'property', key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

/** 라우트 전환마다 title/description/OG 태그와 robots 지시자를 갱신한다. */
export function useDocumentMeta({ title, description, noindex }: DocumentMetaOptions) {
  useEffect(() => {
    document.title = title;
    setMetaTag('property', 'og:title', title);

    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
    }

    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      removeMetaTag('name', 'robots');
    }
  }, [title, description, noindex]);
}

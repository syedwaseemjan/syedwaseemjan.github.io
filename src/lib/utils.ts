import { SITE } from '../consts';

/** Reading time: ~180 wpm, minimum 1 min. */
export function readingTime(htmlOrText: string): string {
  const text = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min read`;
}

/** First-paragraph excerpt, capped at ~50 words. */
export function excerpt(markdown: string, wordLimit = 50): string {
  const withoutFm = markdown.replace(/^---[\s\S]*?---\n*/, '');
  const firstPara = withoutFm.split(/\n\s*\n/).find((p) => p.trim()) ?? withoutFm;
  const plain = firstPara
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Tags go first, otherwise stripping markdown punctuation eats the closing bracket
    .replace(/<[^>]+>/g, '')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const words = plain.split(' ');
  if (words.length <= wordLimit) return plain;
  return words.slice(0, wordLimit).join(' ') + '…';
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function absoluteUrl(path: string, site = SITE.url): string {
  const base = site.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p === '/' ? '/' : p.replace(/\/$/, '')}`;
}

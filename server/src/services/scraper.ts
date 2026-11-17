import * as cheerio from 'cheerio';

export interface ScrapedPage {
  title: string;
  content: string;
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedPage> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported');
    }
  } catch (err) {
    throw new Error('Invalid URL provided');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let html: string;
  try {
    const res = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch page: received HTTP ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(`Unsupported content-type: ${contentType}. Expected HTML.`);
    }

    html = await res.text();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out while fetching the webpage (10s limit)');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);

  $('script, style, noscript, svg, iframe, nav, footer, header, aside, .advertisement, #cookie-banner').remove();

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').first().text().trim() ||
    parsedUrl.hostname;

  let text = $('article, main, .content, #content').text();
  if (!text || text.trim().length < 50) {
    text = $('body').text();
  }

  const cleanedText = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();

  if (!cleanedText) {
    throw new Error('Could not extract readable text content from URL');
  }

  return {
    title: title.slice(0, 150),
    content: cleanedText,
  };
}

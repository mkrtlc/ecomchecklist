export interface ImageInfo {
  src: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  alt?: string;
  loading?: string;
  isLazy?: boolean;
}

export interface ImagesAnalysis {
  images: ImageInfo[];
  productImages: ImageInfo[];
  stats: {
    total: number;
    withAlt: number;
    lazy: number;
    largeImages: number; // > 500KB
    modernFormats: number; // webp, avif
  };
  raw?: unknown;
}

export interface ImagesAdapter {
  analyzeProductImages: (url: string) => Promise<ImagesAnalysis>;
}

// Extract images from HTML (static analysis)
export function createStaticImagesAdapter(htmlAdapter: {
  fetchHtml: (url: string) => Promise<{ html: string }>;
}): ImagesAdapter {
  return {
    async analyzeProductImages(url: string): Promise<ImagesAnalysis> {
      const { html } = await htmlAdapter.fetchHtml(url);
      const images: ImageInfo[] = [];

      // Extract img tags
      const imgRegex = /<img[^>]*>/gi;
      const imgMatches = html.match(imgRegex) || [];

      for (const imgTag of imgMatches) {
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        const altMatch = imgTag.match(/alt=["']([^"']*?)["']/i);
        const widthMatch = imgTag.match(/width=["']?(\d+)/i);
        const heightMatch = imgTag.match(/height=["']?(\d+)/i);
        const loadingMatch = imgTag.match(/loading=["']([^"']+)["']/i);
        const srcsetMatch = imgTag.match(/srcset=["']([^"']+)["']/i);

        if (srcMatch) {
          let src = srcMatch[1];

          // Handle relative URLs
          try {
            src = new URL(src, url).toString();
          } catch {
            // Keep original if URL construction fails
          }

          // Detect format from URL
          let format: string | undefined;
          const formatMatch = src.match(/\.([a-z]{3,4})(?:\?|$)/i);
          if (formatMatch) {
            format = formatMatch[1].toLowerCase();
          } else if (src.includes('format=webp') || src.includes('fm=webp')) {
            format = 'webp';
          } else if (src.includes('format=avif') || src.includes('fm=avif')) {
            format = 'avif';
          }

          images.push({
            src,
            alt: altMatch?.[1],
            width: widthMatch ? parseInt(widthMatch[1]) : undefined,
            height: heightMatch ? parseInt(heightMatch[1]) : undefined,
            format,
            loading: loadingMatch?.[1],
            isLazy: loadingMatch?.[1] === 'lazy' || imgTag.includes('data-src') || imgTag.includes('lazyload'),
          });

          // Also check srcset for additional images
          if (srcsetMatch) {
            const srcsetParts = srcsetMatch[1].split(',');
            for (const part of srcsetParts.slice(0, 3)) {
              // Limit srcset parsing
              const srcsetUrl = part.trim().split(/\s+/)[0];
              if (srcsetUrl && srcsetUrl !== src) {
                try {
                  const fullUrl = new URL(srcsetUrl, url).toString();
                  images.push({
                    src: fullUrl,
                    alt: altMatch?.[1],
                    format: fullUrl.match(/\.([a-z]{3,4})(?:\?|$)/i)?.[1]?.toLowerCase(),
                    isLazy: loadingMatch?.[1] === 'lazy',
                  });
                } catch {
                  // Skip invalid URLs
                }
              }
            }
          }
        }
      }

      // Identify product images (heuristics)
      const productImages = images.filter(img => {
        const src = img.src.toLowerCase();
        const alt = (img.alt || '').toLowerCase();

        // Product image indicators
        const productIndicators = [
          /product/i,
          /item/i,
          /goods/i,
          /files\/.*\d/i,
          /cdn.*\/products?\//i,
          /images?\/products?\//i,
          /media\/catalog/i,
        ];

        // Exclude common non-product images
        const excludePatterns = [
          /logo/i,
          /icon/i,
          /banner/i,
          /badge/i,
          /button/i,
          /sprite/i,
          /avatar/i,
          /payment/i,
          /social/i,
          /tracking/i,
          /pixel/i,
          /1x1/i,
        ];

        const isExcluded = excludePatterns.some(p => p.test(src) || p.test(alt));
        if (isExcluded) return false;

        const isProduct = productIndicators.some(p => p.test(src) || p.test(alt));
        if (isProduct) return true;

        // Large images are often product images
        if (img.width && img.height && img.width >= 300 && img.height >= 300) {
          return true;
        }

        return false;
      });

      // Calculate stats
      const modernFormats = ['webp', 'avif'];
      const stats = {
        total: images.length,
        withAlt: images.filter(i => i.alt && i.alt.length > 0).length,
        lazy: images.filter(i => i.isLazy).length,
        largeImages: 0, // Would need actual file size from requests
        modernFormats: images.filter(i => i.format && modernFormats.includes(i.format)).length,
      };

      return {
        images,
        productImages,
        stats,
        raw: {
          method: 'static-analysis',
          totalParsed: imgMatches.length,
        },
      };
    },
  };
}

// Analyze image quality (requires actual image fetch)
export async function analyzeImageQuality(
  imageUrl: string
): Promise<{ width?: number; height?: number; bytes?: number; format?: string } | null> {
  try {
    const response = await fetch(imageUrl, {
      method: 'HEAD',
    });

    if (!response.ok) return null;

    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');

    let format: string | undefined;
    if (contentType) {
      if (contentType.includes('webp')) format = 'webp';
      else if (contentType.includes('avif')) format = 'avif';
      else if (contentType.includes('png')) format = 'png';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) format = 'jpeg';
      else if (contentType.includes('gif')) format = 'gif';
      else if (contentType.includes('svg')) format = 'svg';
    }

    return {
      bytes: contentLength ? parseInt(contentLength) : undefined,
      format,
    };
  } catch {
    return null;
  }
}

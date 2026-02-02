"use client";

import { useState } from "react";
import { ExternalLink, Globe, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WebsitePreviewProps {
  url: string;
  screenshotUrl?: string | null;
  platform?: string | null;
  className?: string;
}

// Generate thum.io screenshot URL as fallback
function getThumioUrl(url: string): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://image.thum.io/get/width/1200/crop/675/noanimate/${encodedUrl}`;
}

// Platform display config
const PLATFORM_CONFIG: Record<string, { label: string; color: string }> = {
  shopify: { label: "Shopify", color: "bg-green-500" },
  woocommerce: { label: "WooCommerce", color: "bg-purple-500" },
  magento: { label: "Magento", color: "bg-orange-500" },
  bigcommerce: { label: "BigCommerce", color: "bg-blue-500" },
  squarespace: { label: "Squarespace", color: "bg-gray-700" },
  wix: { label: "Wix", color: "bg-yellow-500" },
  prestashop: { label: "PrestaShop", color: "bg-pink-500" },
  opencart: { label: "OpenCart", color: "bg-cyan-500" },
};

export function WebsitePreview({
  url,
  screenshotUrl,
  platform,
  className,
}: WebsitePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const finalScreenshotUrl = screenshotUrl || getThumioUrl(url);
  const platformConfig = platform ? PLATFORM_CONFIG[platform.toLowerCase()] : null;

  return (
    <div className={cn("bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden", className)}>
      {/* Screenshot */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
        {!imageError ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-green-500 animate-spin" />
                  <span className="text-xs text-muted-foreground">Loading preview...</span>
                </div>
              </div>
            )}
            <img
              src={finalScreenshotUrl}
              alt={`Screenshot of ${displayUrl}`}
              className={cn(
                "w-full h-full object-cover object-top transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImageOff className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm">Preview unavailable</span>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-t">
        <div className="flex items-center gap-3 min-w-0">
          <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate" title={url}>
            {displayUrl}
          </span>
          {platformConfig && (
            <span
              className={cn(
                "flex-shrink-0 px-2 py-0.5 text-xs font-medium text-white rounded",
                platformConfig.color
              )}
            >
              {platformConfig.label}
            </span>
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <Button variant="outline" size="sm" className="gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Site</span>
          </Button>
        </a>
      </div>
    </div>
  );
}

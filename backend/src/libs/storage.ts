import { supabase } from "./supabase";

interface CachedUrl {
  url: string;
  expiresAt: number;
}

class UrlCache {
  private cache = new Map<string, CachedUrl>();
  private readonly cacheExpirySeconds = 86400; // 24 hours (URLs never expire for public bucket)

  getPublicUrl(storagePath: string): string | null {
    if (!storagePath) return null;

    const { data } = supabase.storage
      .from("portfolio-bucket")
      .getPublicUrl(storagePath);
    return data.publicUrl;
  }

  async getCachedPublicUrl(storagePath: string): Promise<string | null> {
    if (!storagePath) return null;

    // Check cache first
    const cached = this.cache.get(storagePath);
    const now = Date.now() / 1000;

    if (cached && cached.expiresAt > now) {
      console.log(`Cache hit for ${storagePath}`);
      return cached.url; // Cache hit
    }

    // Generate public URL
    console.log(`Cache miss for ${storagePath} - generating public URL`);
    const publicUrl = this.getPublicUrl(storagePath);
    if (!publicUrl) return null;

    // Cache it for 24 hours
    this.cache.set(storagePath, {
      url: publicUrl,
      expiresAt: now + this.cacheExpirySeconds,
    });

    return publicUrl;
  }

  async getMultipleCachedUrls(
    paths: (string | null)[]
  ): Promise<(string | null)[]> {
    return Promise.all(
      paths.map((path) => (path ? this.getCachedPublicUrl(path) : null))
    );
  }
}

const urlCache = new UrlCache();

export async function getSignedImageUrl(
  storagePath: string
): Promise<string | null> {
  return urlCache.getCachedPublicUrl(storagePath);
}

export async function getMultipleSignedUrls(
  paths: (string | null)[]
): Promise<(string | null)[]> {
  return urlCache.getMultipleCachedUrls(paths);
}

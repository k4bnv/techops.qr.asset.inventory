// 100MB total cache size for the import operation
export const MAX_CACHE_SIZE = 100 * 1024 * 1024;

export type CachedImage = {
  buffer: Buffer;
  contentType: string;
  size: number;
};

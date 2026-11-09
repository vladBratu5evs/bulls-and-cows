type CacheKey = `${number},${number}`;
const memo: Record<CacheKey, number> = {};

export function countPossibleSecrets(length: number, base: number): number {
  if (length < 0 || base < 0 || length > base) {
    return 0;
  }

  if (length === 0) {
    return 1;
  }

  const cacheKey: CacheKey = `${length},${base}`;
  const cachedValue = memo[cacheKey];

  if (cachedValue !== undefined) {
    return cachedValue;
  }

  const result = base * countPossibleSecrets(length - 1, base - 1);
  memo[cacheKey] = result;

  return result;
}

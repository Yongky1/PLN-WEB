const _cache = new Map();

const CACHE_FRESH_MS = 30_000;   // 30 detik: langsung dari cache
const CACHE_STALE_MS = 120_000;  // 2 menit: serve stale, refresh background

async function cachedFetch(url) {
  const now = Date.now();
  const hit = _cache.get(url);

  const doFetch = async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Backend error ${res.status}`);
    const data = await res.json();
    _cache.set(url, { data, ts: Date.now() });
    return data;
  };

  if (hit) {
    const age = now - hit.ts;
    if (age < CACHE_FRESH_MS) return hit.data;
    if (age < CACHE_STALE_MS) {
      doFetch().catch(e => console.error('[cache] refresh error:', e.message));
      return hit.data;
    }
  }

  return doFetch();
}

// Hapus semua cache entry yang URL-nya mengandung prefix tertentu
function invalidateCache(prefix) {
  for (const key of _cache.keys()) {
    if (key.includes(prefix)) _cache.delete(key);
  }
}

module.exports = { cachedFetch, invalidateCache };

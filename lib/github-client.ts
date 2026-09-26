export class GithubError extends Error {
 constructor(message: string, public status: number, public retryAt?: string) { super(message); }
}
export function rateLimitReset(headers: Headers, now: number): number {
 const retry = headers.get('retry-after');
 const retryTime = retry ? (/^\d+$/.test(retry) ? now + Number(retry) * 1000 : Date.parse(retry)) : 0;
 const reset = headers.get('x-ratelimit-remaining') === '0' ? Number(headers.get('x-ratelimit-reset')) * 1000 : 0;
 return Math.max(now + 1000, Number.isFinite(retryTime) ? retryTime : 0, Number.isFinite(reset) ? reset : 0, !retry && !reset ? now + 60000 : 0);
}
export function createGithubClient({ token, fetcher = fetch, now = Date.now }: { token?: string; fetcher?: typeof fetch; now?: () => number } = {}) {
 const cache = new Map<string, { data: unknown; at: number }>();
 const pending = new Map<string, Promise<unknown>>();
 let blockedUntil = 0;
 const limited = () => new GithubError('GitHub’s public request limit has been reached. Please retry after the time shown below.', 429, new Date(blockedUntil).toISOString());
 async function request<T>(path: string): Promise<T> {
  const saved = cache.get(path);
  if (saved && now() - saved.at < 21600000) return saved.data as T;
  if (blockedUntil > now()) { if (saved) return saved.data as T; throw limited(); }
  const running = pending.get(path); if (running) return running as Promise<T>;
  const job = (async () => {
   try {
    const response = await fetcher(`https://api.github.com${path}`, {
     headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
     cache: 'force-cache', next: { revalidate: 21600 }, signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
     const body: unknown = await response.json().catch(() => null);
     const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : '';
     if (response.status === 429 || (response.status === 403 && (response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after') || /rate limit|secondary rate/i.test(message)))) {
      blockedUntil = rateLimitReset(response.headers, now()); throw limited();
     }
     throw new GithubError(response.status === 404 ? 'GitHub profile not found.' : response.status === 401 ? 'The server’s GitHub token is invalid. Update GITHUB_TOKEN and retry.' : response.status === 403 ? 'GitHub denied access to this public profile.' : 'GitHub is unavailable. Please try again.', response.status === 401 ? 503 : response.status);
    }
    const data: unknown = await response.json();
    // Bound process memory while Next.js keeps the persistent endpoint cache.
    if (cache.size >= 500) cache.delete(cache.keys().next().value!);
    cache.set(path, { data, at: now() });
    return data;
   } catch (error) {
    if (saved && (!(error instanceof GithubError) || ![400, 404].includes(error.status))) return saved.data;
    throw error;
   }
  })();
  pending.set(path, job);
  try { return await job as T; } finally { pending.delete(path); }
 }
 return { request };
}

import 'server-only';
import { unstable_cache } from 'next/cache';
import { fetchGithub, GithubError } from './github';
import { validUsername, type Card } from './types';
// The username is a cache argument: all themes reuse one GitHub snapshot.
// Next.js serves stale data while revalidating and retains it on refresh errors.
const cachedCard = unstable_cache(async (username: string): Promise<Card> => {
 const data = await fetchGithub(username);
 const now = new Date().toISOString();
 return { username, theme: 'coder', data, last_refreshed: now };
}, ['devcard-public-profile-v3'], { revalidate: 21600 });
const inFlight = new Map<string, Promise<Card>>();
export async function getCard(input: string): Promise<Card> {
 const username = input.toLowerCase();
 if (!validUsername(username)) throw new GithubError('Invalid GitHub username.', 404);
 const existing = inFlight.get(username);
 if (existing) return existing;
 const request = cachedCard(username);
 inFlight.set(username, request);
 try { return await request; }
 finally { if (inFlight.get(username) === request) inFlight.delete(username); }
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGithubClient, GithubError, rateLimitReset } from '../lib/github-client';
import { collectGithub } from '../lib/github-data';
import { demoCard } from '../lib/demo';
const fixture = demoCard().data;
const profile = { ...fixture.profile, public_repos: 2, type: 'User' };
const repos = fixture.repos;

test('anonymous generation uses two requests and labels repository-based languages', async () => {
 const calls: string[] = [];
 const client = createGithubClient({ fetcher: async input => { const url = String(input); calls.push(url); return Response.json(url.includes('/repos?') ? repos : profile); } });
 const card = await collectGithub('shadcn', client.request, false);
 assert.equal(calls.length, 2);
 assert.equal(card.stars, 98600);
 assert.equal(card.languages[0].percent, 100);
 assert.match(card.languageLabel!, /primary language/);
 assert.equal(card.languages[0].bytes, 0);
 await collectGithub('shadcn', client.request, false);
 assert.equal(calls.length, 2, 'cached profiles should not consume more requests');
});
test('an optional language quota failure does not prevent card generation', async () => {
 let calls = 0;
 const client = createGithubClient({ fetcher: async input => { calls++; const url = String(input); if (url.endsWith('/languages')) return Response.json({ message: 'API rate limit exceeded' }, { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.ceil(Date.now() / 1000) + 300) } }); return Response.json(url.includes('/repos?') ? repos : profile); } });
 const card = await collectGithub('shadcn', client.request, true);
 assert.equal(card.repos.length, 2);
 assert.match(card.languageLabel!, /primary language/);
 assert.equal(calls, 3, 'stop optional calls immediately after the rate limit');
});
test('quota errors expose retry time and stop repeated upstream calls', async () => {
 let calls = 0; let now = 100000;
 const client = createGithubClient({ now: () => now, fetcher: async () => { calls++; return calls === 1 ? Response.json({ message: 'API rate limit exceeded' }, { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '200' } }) : Response.json(profile); } });
 await assert.rejects(client.request('/users/shadcn'), (e: unknown) => e instanceof GithubError && e.status === 429 && e.retryAt === new Date(200000).toISOString());
 await assert.rejects(client.request('/users/other'), (e: unknown) => e instanceof GithubError && e.status === 429);
 assert.equal(calls, 1);
 now = 201000;
 assert.deepEqual(await client.request('/users/shadcn'), profile);
 assert.equal(calls, 2);
});
test('cached data remains available when refresh hits quota, with concurrent deduplication', async () => {
 let calls = 0; let now = 100000;
 const client = createGithubClient({ now: () => now, fetcher: async () => { calls++; return calls === 1 ? Response.json(profile) : Response.json({ message: 'Rate limit' }, { status: 429, headers: { 'retry-after': '120' } }); } });
 await Promise.all([client.request('/users/shadcn'), client.request('/users/shadcn')]);
 assert.equal(calls, 1);
 now += 21601000;
 assert.deepEqual(await client.request('/users/shadcn'), profile);
 assert.deepEqual(await client.request('/users/shadcn'), profile);
 assert.equal(calls, 2);
});
test('ordinary permission denials are not incorrectly labeled as rate limits', async () => {
 const client = createGithubClient({ fetcher: async () => Response.json({ message: 'Forbidden' }, { status: 403 }) });
 await assert.rejects(client.request('/users/shadcn'), (e: unknown) => e instanceof GithubError && e.status === 403 && !e.retryAt);
});
test('retry-after takes precedence when it is later than the primary reset', () => {
 assert.equal(rateLimitReset(new Headers({ 'retry-after': '180', 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '200' }), 100000), 280000);
});

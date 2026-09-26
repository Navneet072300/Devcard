import 'server-only';
import { createGithubClient } from './github-client';
import { collectGithub } from './github-data';
export { GithubError } from './github-client';
// Preserve successful endpoint responses and backoff during development HMR.
const runtime = globalThis as typeof globalThis & { devcardGithub?: { token?: string; client: ReturnType<typeof createGithubClient> } };
export async function fetchGithub(username: string) {
 const token = process.env.GITHUB_TOKEN?.trim() || undefined;
 if (!runtime.devcardGithub || runtime.devcardGithub.token !== token) runtime.devcardGithub = { token, client: createGithubClient({ token, fetcher: (input, init) => fetch(input, init) }) };
 return collectGithub(username, runtime.devcardGithub.client.request, Boolean(token));
}

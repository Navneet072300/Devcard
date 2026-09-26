import { colors, validUsername, type GithubData, type Profile, type Repo } from './types';
import { GithubError } from './github-client';
type RequestGithub = <T>(path: string) => Promise<T>;
export async function collectGithub(username: string, request: RequestGithub, detailedLanguages: boolean): Promise<GithubData> {
 if (!validUsername(username)) throw new GithubError('Enter a valid GitHub username.', 400);
 const profile = await request<Profile>(`/users/${username}`);
 if ('type' in profile && profile.type !== 'User') throw new GithubError('DevCard is for personal GitHub profiles.', 400);
 const all: Repo[] = [];
 for (let page = 1; page <= Math.ceil(profile.public_repos / 100); page++) {
  const repos = await request<Repo[]>(`/users/${username}/repos?per_page=100&sort=updated&page=${page}`);
  all.push(...repos); if (repos.length < 100) break;
 }
 const originals = all.filter(r => !r.fork);
 const top = [...originals].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
 let totals: Record<string, number> = {};
 let byBytes = detailedLanguages && top.length > 0;
 if (byBytes) {
  try {
   // Sequential requests stop immediately when GitHub asks us to back off.
   for (const repo of top) {
    const languages = await request<Record<string, number>>(`/repos/${username}/${encodeURIComponent(repo.name)}/languages`);
    for (const [name, bytes] of Object.entries(languages)) totals[name] = (totals[name] || 0) + bytes;
   }
  } catch { byBytes = false; totals = {}; }
 }
 if (!byBytes) for (const repo of originals) if (repo.language) totals[repo.language] = (totals[repo.language] || 0) + 1;
 const total = Object.values(totals).reduce((a, b) => a + b, 0);
 const activity = Array.from({ length: 364 }, (_, i) => { const date = new Date(); date.setUTCHours(0, 0, 0, 0); date.setUTCDate(date.getUTCDate() - 363 + i); return { date: date.toISOString().slice(0, 10), count: 0 }; });
 for (const repo of originals) { const day = activity.find(d => d.date === repo.pushed_at?.slice(0, 10)); if (day) day.count++; }
 return { profile, repos: top, stars: all.reduce((sum, r) => sum + r.stargazers_count, 0), languages: Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, bytes: byBytes ? value : 0, percent: total ? value / total * 100 : 0, color: colors[name] || '#a3b1bf' })), languageLabel: byBytes ? 'By code bytes · top repositories' : 'By primary language · public repositories', activity, activityLabel: 'Last push per repository · 52 weeks' };
}

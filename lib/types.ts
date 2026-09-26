export type Theme = typeof themes[number];
export interface Repo { name: string; description: string | null; html_url: string; stargazers_count: number; language: string | null; pushed_at: string; fork: boolean; }
export interface Profile { id: number; login: string; name: string | null; avatar_url: string; bio: string | null; followers: number; following: number; public_repos: number; location: string | null; blog: string | null; html_url: string; }
export interface GithubData { profile: Profile; repos: Repo[]; stars: number; languages: { name: string; bytes: number; percent: number; color: string }[]; activity: { date: string; count: number }[]; activityLabel: string; languageLabel?: string; }
export interface Card { username: string; theme: Theme; data: GithubData; last_refreshed: string; }
export const themes = ['anime', 'ai', 'alien', 'superhero', 'coder', 'linux'] as const;
export const palette: Record<Theme, { bg: string; text: string; muted: string; accent: string; border: string }> = {
 anime: { bg: '#fff8ee', text: '#252030', muted: '#726575', accent: '#ed547f', border: '#302538' },
 ai: { bg: '#0d1128', text: '#eef0ff', muted: '#a0afd3', accent: '#a4a1ff', border: '#303860' },
 alien: { bg: '#071610', text: '#d8f8d2', muted: '#8bae8a', accent: '#c4f76d', border: '#3b5938' },
 superhero: { bg: '#ffe448', text: '#20213d', muted: '#57506b', accent: '#e73550', border: '#25213c' },
 coder: { bg: '#181c27', text: '#e0e6f4', muted: '#9aa8c1', accent: '#80c9b3', border: '#353e51' },
 linux: { bg: '#24132d', text: '#f4e6f1', muted: '#bba8be', accent: '#efa15e', border: '#654865' },
};
export const themeLabels: Record<Theme, string> = { anime: 'Anime', ai: 'AI', alien: 'Alien', superhero: 'Superhero', coder: 'Coder', linux: 'Linux' };
export const themeDescriptions: Record<Theme, string> = { anime: 'Your own character card.', ai: 'A neural interface for your work.', alien: 'An unidentified coding lifeform.', superhero: 'Your developer origin story.', coder: 'Right at home in your editor.', linux: 'A profile straight from the terminal.' };
export function resolveTheme(value: unknown): Theme {
 if (typeof value !== 'string') return 'coder';
 const selected = themes.find(theme => theme === value);
 if (selected) return selected;
 const legacy: Record<string, Theme> = { midnight: 'coder', paper: 'linux', neon: 'ai', ocean: 'alien', sunset: 'superhero', terminal: 'linux', rose: 'anime', arctic: 'ai', amber: 'superhero', blueprint: 'coder', lavender: 'anime', graphite: 'coder' };
 return Object.hasOwn(legacy, value) ? legacy[value] : 'coder';
}
export function cardPath(username: string, theme: Theme) { return `/${encodeURIComponent(username.toLowerCase())}?theme=${theme}`; }
export const colors: Record<string, string> = { TypeScript: '#6ba5f8', JavaScript: '#e9d86a', Python: '#6caf92', Go: '#69d0df', Rust: '#eaa17c', CSS: '#b191ed', HTML: '#ed886c', Ruby: '#ed7181', Swift: '#efaa6c' };
export function validUsername(value: string) { return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(value); }
export function compact(value: number) { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value); }

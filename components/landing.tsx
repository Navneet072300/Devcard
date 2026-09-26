'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Github, LoaderCircle, Check } from 'lucide-react';
import { DevCard } from './dev-card';
import { CardMotion } from './card-motion';
import { demoCard } from '@/lib/demo';
import { palette, themeLabels, cardPath, validUsername, type Card, type Theme } from '@/lib/types';
const sample = demoCard();
export function Landing() {
 const router = useRouter();
 const [username, setUsername] = useState('');
 const [theme, setTheme] = useState<Theme>('anime');
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const [retryAt, setRetryAt] = useState<number | null>(null);
 const [clock, setClock] = useState(Date.now());
 useEffect(() => { if (!retryAt) return; const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, [retryAt]);
 const coolingDown = retryAt !== null && clock < retryAt;
 useEffect(() => {
  const context = (document as Document & { modelContext?: { registerTool: (tool: { name: string; description: string; inputSchema: object; execute: (input: unknown) => Promise<object> }, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
  if (!context) return;
  const lifecycle = new AbortController();
  try { void Promise.resolve(context.registerTool({ name: 'generate_devcard', description: 'Generate a public GitHub card and open its theme editor.', inputSchema: { type: 'object', properties: { username: { type: 'string' } }, required: ['username'], additionalProperties: false }, execute: async input => {
   if (!input || typeof input !== 'object' || !('username' in input) || typeof input.username !== 'string' || !validUsername(input.username)) throw new Error('Invalid GitHub username.');
   const response = await fetch(`/api/card/${encodeURIComponent(input.username)}`); const result = await response.json(); if (!response.ok) throw new Error(result.error);
   const path = cardPath((result as Card).username, 'coder'); router.push(path); return { path };
  } }, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Optional browser capability. */ }
  return () => lifecycle.abort();
 }, [router]);
 async function submit(e: FormEvent) {
  e.preventDefault(); if (!validUsername(username) || busy || coolingDown) return;
  setBusy(true); setError(''); setRetryAt(null);
  try { const response = await fetch(`/api/card/${encodeURIComponent(username)}`); const result = await response.json(); if (!response.ok) { if (typeof result.retryAt === 'string' && Number.isFinite(Date.parse(result.retryAt))) { setRetryAt(Date.parse(result.retryAt)); setClock(Date.now()); } throw new Error(result.error); } router.push(cardPath((result as Card).username, theme)); }
  catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Try again.'); setBusy(false); }
 }
 return <section className="hero simple-hero"><div className="hero-copy"><div className="eyebrow"><span/> YOUR GITHUB, WITH PERSONALITY</div><h1>Your code.<br/>Your card.<br/><span>Your kind of style.</span></h1><p className="hero-description">Turn your GitHub into a card worth sharing.<br/>Pick a look, download it, or send the link.<br/>No login. All yours.</p><form onSubmit={submit} className="generate-form"><label htmlFor="username" className="sr-only">GitHub username</label><div className="input-row"><Github size={21}/><span className="input-prefix">github.com/</span><input id="username" autoComplete="off" spellCheck={false} placeholder="your-username" value={username} disabled={busy} onChange={e => { setUsername(e.target.value.trim()); setError(''); }} aria-describedby="form-feedback" aria-invalid={Boolean(username && !validUsername(username))}/>{username && validUsername(username) && <Check size={16} className="valid"/>}</div><button className="primary" disabled={busy || coolingDown || !validUsername(username)}>{busy ? <><LoaderCircle className="spin" size={18}/>Building your card…</> : coolingDown ? <>Retry in {Math.ceil((retryAt! - clock) / 60000)} min</> : <>Generate my card <ArrowRight size={18}/></>}</button><p id="form-feedback" role="status" className={error ? 'error' : 'form-note'}>{error || (username && !validUsername(username) ? 'Use letters, numbers, and single hyphens.' : '6 completely different designs. No sign-up required.')}</p>{retryAt && <p className="form-note" role="status">{coolingDown ? `Available after ${new Date(retryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Your card doesn’t require login.` : 'You can try generating your card again now.'}</p>}</form><div className="steps"><span>01 <b>Generate</b></span><span>02 <b>Find your style</b></span><span>03 <b>Share it</b></span></div></div><div className="hero-preview"><div className="preview-caption"><span><i/> ONE PROFILE. SO MANY POSSIBILITIES.</span></div><CardMotion><DevCard data={sample} theme={theme}/></CardMotion><div className="sample-switcher" role="group" aria-label="Sample card theme">{(['anime','ai','alien','superhero','coder','linux'] as const).map(t => <button key={t} style={{ background: palette[t].bg, color: palette[t].text, borderColor: theme === t ? palette[t].accent : palette[t].border }} aria-label={`Preview ${t} theme`} aria-pressed={theme === t} onClick={() => setTheme(t)}><i style={{ background: palette[t].accent }}/>{themeLabels[t]}</button>)}<span>Anime · AI · Alien · Superhero · Coder · Linux</span></div><p className="demo-note">Sample card · illustrative stats</p></div></section>;
}

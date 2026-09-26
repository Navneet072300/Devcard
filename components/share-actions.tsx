'use client';
import { useEffect, useState } from 'react';
import { Copy, Download, ArrowUpRight, Check } from 'lucide-react';
import { cardPath, type Theme } from '@/lib/types';
export function ShareActions({ username, theme }: { username: string; theme: Theme }) {
 const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [origin, setOrigin] = useState('');
 useEffect(() => { setOrigin(window.location.origin); }, []);
 useEffect(() => { setMessage(''); }, [theme, username]);
 const url = origin + cardPath(username, theme);
 async function copy() { try { await navigator.clipboard.writeText(url); setMessage('Link copied — your theme is included.'); } catch { setMessage(`Copy this link: ${url}`); } }
 async function download() {
  setBusy(true); setMessage('');
  try {
   const el = document.getElementById('devcard'); if (!el) throw new Error('Card unavailable');
   // Clone now so a theme change during export cannot change the downloaded card.
   const clone = el.cloneNode(true) as HTMLElement;
   clone.id = 'devcard-export';
   const frame = document.createElement('div'); frame.className = 'export-frame studio-result'; frame.style.width = `${el.getBoundingClientRect().width}px`; frame.appendChild(clone); document.body.appendChild(frame);
   try {
    const { toPng } = await import('html-to-image');
    await document.fonts.ready;
    await Promise.all(Array.from(clone.querySelectorAll('img')).map(img => img.decode().catch(() => {})));
    const data = await toPng(clone, { pixelRatio: 2, cacheBust: true });
    const anchor = document.createElement('a'); anchor.download = `${username}-${theme}-devcard.png`; anchor.href = data; anchor.click();
    setMessage(`${theme[0].toUpperCase() + theme.slice(1)} card downloaded.`);
   } finally { frame.remove(); }
  } catch { setMessage('PNG export failed. Please try again, or share your card link.'); }
  finally { setBusy(false); }
 }
 return <div className="export-panel"><div className="export-primary"><button className="primary" disabled={busy} onClick={download}><Download size={17}/>{busy ? 'Rendering your card…' : 'Download PNG'}</button><button className="secondary" onClick={copy} disabled={!origin}>{message.startsWith('Link copied') ? <Check size={16}/> : <Copy size={16}/>}Copy link</button></div><div className="social-links"><span>Or share your look</span><a aria-disabled={!origin} href={origin ? `https://twitter.com/intent/tweet?text=${encodeURIComponent('My work, my style. My DevCard:')}&url=${encodeURIComponent(url)}` : undefined} target="_blank" rel="noreferrer">X <ArrowUpRight size={13}/></a><a aria-disabled={!origin} href={origin ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` : undefined} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13}/></a></div><p className="export-status" role="status">{message}</p></div>;
}

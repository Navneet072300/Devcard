'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Palette } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DevCard } from './dev-card';
import { ShareActions } from './share-actions';
import { cardPath, resolveTheme, themes, themeLabels, themeDescriptions, type Card, type Theme } from '@/lib/types';
function DesignThumbnail({ card, theme }: { card: Card; theme: Theme }) {
 const frame = useRef<HTMLDivElement>(null);
 const [scale, setScale] = useState(.28);
 useEffect(() => {
  if (!frame.current) return;
  const observer = new ResizeObserver(entries => { const width = entries[0]?.contentRect.width; if (width) setScale(width / 500); });
  observer.observe(frame.current);
  return () => observer.disconnect();
 }, []);
 return <div ref={frame} className="design-thumbnail" aria-hidden="true" inert><div className="thumbnail-scale" style={{ transform: `scale(${scale})` }}><DevCard data={card} theme={theme} miniature/></div></div>;
}
export function CardStudio({ card, initialTheme }: { card: Card; initialTheme: Theme }) {
 const search = useSearchParams();
 const [theme, setTheme] = useState(initialTheme);
 useEffect(() => { setTheme(resolveTheme(search.get('theme'))); }, [search]);
 function choose(next: Theme) { setTheme(next); window.history.replaceState(null, '', cardPath(card.username, next)); }
 const hours = Math.max(0, Math.floor((Date.now() - Date.parse(card.last_refreshed)) / 3600000));
 return <section className="studio"><div className="studio-heading"><div><Link href="/" className="back-link"><ArrowLeft size={14}/>Try another username</Link><h1>Same you. <span>A whole new look.</span></h1><p>Six different worlds. One developer. Find yours.</p></div><span className="profile-chip"><img src={card.data.profile.avatar_url} width={26} height={26} alt=""/>@{card.username}</span></div><div className="studio-grid"><aside className="style-panel"><div className="style-heading"><h2><Palette size={17}/>Choose your world</h2><span>6 designs</span></div><div className="style-grid" role="group" aria-label="Choose your card theme">{themes.map(t => <button key={t} className={`style-option design-option ${theme === t ? 'active' : ''}`} aria-pressed={theme === t} onClick={() => choose(t)}><DesignThumbnail card={card} theme={t}/><span className="style-title">{themeLabels[t]}<span>{theme === t && <Check size={14}/>}</span></span><span className="style-description">{themeDescriptions[t]}</span></button>)}</div><p className="style-hint">Your choice travels with your link. Change it anytime.</p></aside><div className="studio-result"><div className="result-caption"><div><span className="selected-theme">{themeLabels[theme]}</span><span>{themeDescriptions[theme]}</span></div><span className="live-label"><i/>LIVE PREVIEW</span></div><div className="preview-stage"><DevCard data={card} theme={theme}/></div><ShareActions username={card.username} theme={theme}/><p className="studio-freshness">Public GitHub data · Updated {hours ? `${hours}h ago` : 'just now'}{hours >= 6 ? ' · showing cached stats' : ''}</p></div></div></section>;
}

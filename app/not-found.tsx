import Link from 'next/link';
export default function NotFound() { return <div className="center-state"><div className="eyebrow">404 · A SMALL DETOUR</div><h1>We couldn’t find that developer.</h1><p>Double-check the GitHub username, then give it another go. No account needed.</p><Link href="/" className="primary">Create a DevCard →</Link></div>; }

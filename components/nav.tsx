import Link from 'next/link';
import { Command, ArrowUpRight } from 'lucide-react';
export function Nav() { return <header className="nav"><Link href="/" className="wordmark"><Command size={24}/>devcard</Link><nav><span className="nav-note">No account. Just your GitHub.</span><Link href="/" className="nav-login">Create a card <ArrowUpRight size={15}/></Link></nav></header>; }
export function Footer() { return <footer><Link href="/" className="wordmark"><Command size={18}/>devcard</Link><span>Your GitHub. Your style.</span><a href="https://github.com" target="_blank" rel="noreferrer">Built with public GitHub data ↗</a></footer>; }

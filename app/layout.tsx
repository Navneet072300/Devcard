import type { Metadata } from 'next';
import { Nav, Footer } from '@/components/nav';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), title: { default: 'DevCard — Your code tells a story', template: '%s · DevCard' }, description: 'Turn your GitHub profile into a beautiful, shareable developer card.' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" data-scroll-behavior="smooth"><body><div className="site-shell"><Nav/><main>{children}</main><Footer/></div></body></html>; }

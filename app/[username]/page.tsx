import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getCard } from '@/lib/cards';
import { GithubError } from '@/lib/github';
import { CardStudio } from '@/components/card-studio';
import { cardPath, resolveTheme } from '@/lib/types';
type Props = { params: Promise<{ username: string }>; searchParams: Promise<{ theme?: string | string[] }> };
const load = cache(async (username: string) => { try { return await getCard(username); } catch (e) { if (e instanceof GithubError && e.status === 404) notFound(); throw e; } });
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
 const card = await load((await params).username); const theme = resolveTheme((await searchParams).theme);
 const title = `${card.data.profile.name || card.username}'s DevCard`;
 const description = card.data.profile.bio || 'Building in the open.';
 const image = `/api/og/${card.username}?theme=${theme}`;
 return { title, description, alternates: { canonical: cardPath(card.username, theme) }, openGraph: { title, description, url: cardPath(card.username, theme), images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: 'summary_large_image', title, description, images: [image] } };
}
export default async function PublicCard({ params, searchParams }: Props) {
 const card = await load((await params).username);
 return <CardStudio card={card} initialTheme={resolveTheme((await searchParams).theme)}/>;
}

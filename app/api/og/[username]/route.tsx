import { ImageResponse } from 'next/og';
import { getCard } from '@/lib/cards';
import { GithubError } from '@/lib/github';
import { resolveTheme } from '@/lib/types';
import { DevCard } from '@/components/dev-card';
export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
 try {
  const card = await getCard((await params).username);
  const theme = resolveTheme(new URL(request.url).searchParams.get('theme'));
  return new ImageResponse(<DevCard data={card} theme={theme} og/>, { width: 1200, height: 630, headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' } });
 } catch (e) { return new Response('Card image unavailable', { status: e instanceof GithubError ? e.status : 503 }); }
}

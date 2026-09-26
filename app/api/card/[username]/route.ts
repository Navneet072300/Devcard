import { NextResponse } from 'next/server';
import { getCard } from '@/lib/cards';
import { GithubError } from '@/lib/github';
export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
 try { return NextResponse.json(await getCard((await params).username)); }
 catch (e) {
  const retryAt = e instanceof GithubError ? e.retryAt : undefined;
  const seconds = retryAt ? Math.max(1, Math.ceil((Date.parse(retryAt) - Date.now()) / 1000)) : undefined;
  return NextResponse.json({ error: e instanceof GithubError ? e.message : 'Could not load this card. Please try again.', ...(retryAt ? { retryAt } : {}) }, { status: e instanceof GithubError ? e.status : 503, headers: { 'Cache-Control': 'no-store', ...(seconds ? { 'Retry-After': String(seconds) } : {}) } });
 }
}

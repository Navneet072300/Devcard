'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="center-state"><h1>A brief intermission.</h1><p>We couldn’t load this card right now. GitHub may be temporarily unavailable.</p><button className="primary" onClick={reset}>Try again</button></div>; }

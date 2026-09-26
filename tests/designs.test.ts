import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DevCard } from '../components/dev-card';
import { demoCard } from '../lib/demo';
import { themes, type Theme } from '../lib/types';
const card = demoCard();
const markers: Record<Theme, string> = { anime: 'CHARACTER FILE', ai: 'NEURAL PROFILE', alien: 'EXTRATERRESTRIAL ARCHIVE', superhero: 'THE INCREDIBLE DEVELOPER', coder: 'developer.ts', linux: 'fastfetch --github' };
test('each design renders its own composition with real profile data', () => {
 for (const theme of themes) {
  const html = renderToStaticMarkup(createElement(DevCard, { data: card, theme }));
  assert.ok(html.includes(markers[theme]), theme);
  assert.ok(html.includes(`data-design="${theme}"`), theme);
  assert.ok(html.includes('id="devcard"'), theme);
  assert.ok(html.includes('shadcn-ui/taxonomy'), theme);
  assert.ok(html.includes('TypeScript'), theme);
  for (const other of themes.filter(t => t !== theme)) assert.ok(!html.includes(markers[other]), `${theme} should not reuse ${other}'s layout`);
 }
});
test('picker miniatures use each template without duplicate export targets', () => {
 for (const theme of themes) {
  const html = renderToStaticMarkup(createElement(DevCard, { data: card, theme, miniature: true }));
  assert.ok(html.includes(markers[theme]));
  assert.ok(!html.includes('id="devcard"'));
 }
});
test('share images preserve design-specific composition, not only palette', () => {
 for (const theme of themes) {
  const html = renderToStaticMarkup(createElement(DevCard, { data: card, theme, og: true }));
  assert.ok(html.includes(markers[theme]), theme);
  assert.ok(html.includes('shadcn'), theme);
  assert.ok(html.includes(`data-design="${theme}"`), theme);
 }
});

test('all six OG designs render into actual 1200×630 PNGs', async () => {
 const { ImageResponse } = await import('next/og');
 const fixture = demoCard();
 // An embedded avatar makes rendering validation independent of GitHub quotas.
 fixture.data.profile.avatar_url = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#78909c"/></svg>').toString('base64');
 for (const theme of themes) {
  const response = new ImageResponse(createElement(DevCard, { data: fixture, theme, og: true }), { width: 1200, height: 630 });
  const png = Buffer.from(await response.arrayBuffer());
  assert.equal(png.subarray(1, 4).toString(), 'PNG', theme);
  assert.equal(png.readUInt32BE(16), 1200, theme);
  assert.equal(png.readUInt32BE(20), 630, theme);
 }
});

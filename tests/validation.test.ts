import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validUsername, compact, themes, palette, resolveTheme, cardPath } from '../lib/types';
test('GitHub usernames accept singles and reject invalid boundaries and paths', () => {
 for (const input of ['a', 'shadcn', 'a-b', 'A12', 'x'.repeat(39)]) assert.equal(validUsername(input), true, input);
 for (const input of ['', '-a', 'a-', 'a--b', 'a_b', '../admin', 'a/b', 'x'.repeat(40), 'a b']) assert.equal(validUsername(input), false, input);
});
test('card statistics use compact human-readable notation', () => { assert.equal(compact(1200), '1.2K'); assert.equal(compact(0), '0'); });

test('theme links round-trip every supported style and normalize usernames', () => {
 for (const theme of themes) {
  const url = new URL(cardPath('OctoCat', theme), 'https://devcard.example');
  assert.equal(url.pathname, '/octocat');
  assert.equal(resolveTheme(url.searchParams.get('theme')), theme);
  assert.equal(new Set(Object.values(palette[theme])).size, 5);
 }
});
test('missing, repeated or untrusted theme parameters fall back safely', () => {
 for (const theme of [null, undefined, '', 'unknown', '__proto__', 'constructor', ['neon', 'paper'], '<script>']) assert.equal(resolveTheme(theme), 'coder');
});


test('older palette links map to a full design', () => {
 assert.equal(resolveTheme('midnight'), 'coder');
 assert.equal(resolveTheme('neon'), 'ai');
 assert.equal(resolveTheme('rose'), 'anime');
 assert.equal(resolveTheme('terminal'), 'linux');
});

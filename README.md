# DevCard

A login-free GitHub card builder. Enter a username, explore six complete card designs, download a PNG, or share a link that preserves the selected theme. No OAuth, accounts, dashboard, analytics, or database setup.

## Run

Requires Node.js 20.9+.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Set optional `GITHUB_TOKEN` for a higher GitHub REST API quota. The token remains server-only. Set `NEXT_PUBLIC_SITE_URL` to your deployed origin so OpenGraph URLs resolve correctly.

## The flow

- `/`: enter a username and generate a card. The homepage sample is clearly labeled as illustrative.
- `/username?theme=alien`: explore six designs with thumbnails of that profile and a full live preview. The selected theme updates the URL without refetching GitHub data.
- Copy link, X and LinkedIn sharing all include the theme. A recipient sees that same theme on first render.
- PNG export captures the selected card at 2× resolution; its filename includes the username and theme. The export clone is frozen while downloading so changing themes cannot alter an in-progress download.
- `/api/og/username?theme=alien` generates the matching 1200×630 social image using the same DevCard component.

Each design has its own markup, composition, typography, and shared-image layout:

- Anime: manga character card, tilted portrait, chapter headers and skill tree.
- AI: centered neural profile, avatar rings and telemetry modules.
- Alien: specimen dossier, scanned portrait, transmission and recovered artifacts.
- Superhero: comic cover, halftone panel, speech bubble and bold stat tiles.
- Coder: editor window, file tabs, project rail, syntax-highlighted profile and status bar.
- Linux: terminal window, fastfetch identity, command output and ANSI color palette.

The design picker uses actual miniature DevCard components. Previous palette links map to an appropriate full design so old shared URLs keep working.

## Data and caching

`lib/github.ts` coordinates a cached GitHub client and the profile collector. Anonymous lookups normally use two requests (profile and first repository page); larger accounts paginate repositories. Language percentages use primary repository languages and are labeled accordingly. With GITHUB_TOKEN configured, the top six repositories can supply byte-level language data; failure of that optional enrichment falls back to repository languages without blocking the card. Activity shows each repository’s last push across 52 weeks, clearly labeled; it is not a full contribution history.

`lib/cards.ts` caches snapshots using the Next.js Data Cache for six hours. All themes share the same snapshot. Next.js retains stale snapshots while background revalidation retries after upstream errors. Public pages render the theme from the query parameter; they do not maintain server-side user preferences. No public edit or refresh endpoints exist.

The old OAuth routes, dashboard, auth proxy, view tracking, Supabase integration, and related dependencies have been removed. Existing external Supabase projects, tables, and OAuth provider settings are not modified or needed by this app.

## Deploy

Import this directory into Vercel as a Next.js project. Set `NEXT_PUBLIC_SITE_URL` to the production domain and optionally set `GITHUB_TOKEN`. Deploy. No OAuth callbacks or database migrations are required.

## GitHub request limits

Anonymous GitHub REST requests share a 60-request/hour quota for the server’s IP. A missing cached profile cannot be fetched while that quota is exhausted. DevCard shows the reset time, honors `Retry-After`, deduplicates concurrent requests, and serves previously successful endpoint responses during temporary failures. Successful endpoint responses are also cached by Next.js for six hours.

To raise the quota, create a GitHub personal access token for public-data reads and put it in `.env.local` (or Vercel environment settings):

```dotenv
GITHUB_TOKEN=your_token_here
```

Restart the local development server after changing the environment. Do not commit or paste the token into chat. This is a server credential only: visitors still do not log in. If no token is configured, wait until the retry time displayed in the form.

Reference: [GitHub rate-limit documentation](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## Checks

```sh
npm test
npm run typecheck
npm run build
```

The tests cover username validation, theme resolution, and theme-preserving card links. The build uses Webpack for compatibility with restricted local environments. Optional WebMCP generation is feature-detected; it is not required by the normal browser flow.
# Devcard

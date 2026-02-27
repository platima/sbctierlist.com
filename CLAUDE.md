# CLAUDE.md — AI Assistant Context

This file provides project context for AI coding assistants (GitHub Copilot,
Claude, etc.). It is read at the start of each session so the assistant
understands the project without re-discovering everything.

## Project Overview

**SBC Tier List** — A static, single-page website that ranks Single Board
Computers (SBCs), embedded SBCs (eSBCs), Embedded System Boards (ESBs), and
Development Boards across S–D tiers, with linked video reviews and purchase
options.

Live at **[sbctierlist.com](https://sbctierlist.com)**, owned and maintained by
[platima](https://github.com/platima).

## Architecture

This is a **no-build static site**. There is no compilation, bundling, or
package manager involved.

```
index.html          Entry point; loads React + Babel from CDN, mounts app
js/app.js           Full React application (JSX transpiled in-browser by Babel)
css/styles.css      All styles; dark-theme only, fully responsive
data.json           Board data (single source of truth)
img/                Board images (PNG, one per board)
favicons/           Favicon assets + site.webmanifest
```

React and Babel are loaded via cdnjs CDN:
- React 18.3.1 (`react.production.min.js` + `react-dom.production.min.js`)
- Babel standalone 7.26.10 (transpiles JSX in the browser at runtime)

> **Note:** In-browser Babel transpilation is intentional for this simple hobby
> site — no build step to maintain. For a larger project this would be
> inappropriate.

## Tech Stack

| Layer      | Detail                                              |
|------------|-----------------------------------------------------|
| UI         | React 18.3.1 (UMD bundle via CDN)                  |
| JSX        | Babel standalone 7.26.10 (in-browser transpilation) |
| Styling    | Plain CSS, dark theme, custom properties            |
| Data       | `data.json` fetched at runtime (`fetch()`)          |
| Hosting    | Cloudflare Pages with custom domain (`CNAME`)       |
| Deploy     | Push to `main` → Cloudflare Pages (auto-deploy)    |

## Key Files

| File                    | Purpose                                              |
|-------------------------|------------------------------------------------------|
| `index.html`            | Entry point; CDN scripts, meta tags, mounts `#root` |
| `js/app.js`             | React app — `Modal`, `TierList` components          |
| `css/styles.css`        | All styling (no Tailwind, no frameworks)            |
| `data.json`             | Board data array                                     |
| `img/`                  | Board images referenced by `imagePath` in data      |
| `favicons/`             | Favicon PNGs + `site.webmanifest`                   |
| `CNAME`                 | Custom domain for GitHub Pages (`sbctierlist.com`)  |

## Data Structure

All board data lives in `data.json` as a flat array. Each entry:

```json
{
  "name": "Board Display Name",
  "videoUrl": "https://youtu.be/...",
  "imagePath": "/img/filename.png",
  "tier": "S",
  "tierPosition": 0,
  "reviewDate": "2025-01-10",
  "purchaseLink": "https://...",
  "type": "SBC"
}
```

### Field Notes

- `tier` — one of `S`, `A`, `B`, `C`, `D`
- `tierPosition` — 0-based integer; controls order within a tier row
- `imagePath` — **must start with `/`** (absolute from site root)
- `type` — **case-sensitive**; one of `SBC`, `eSBC`, `ESB`, `DevBoard`
  - Definitions: [github.com/platima/board-taxomomies](https://github.com/platima/board-taxomomies)
  - Note: the repo name intentionally contains a typo ("taxomomies"); do not
    "correct" links that point there.

## Tier Score Ranges

Each tier corresponds to a numeric score range, displayed as a subtitle on the tier label:

| Tier | Score range |
|------|-------------|
| S    | 25+         |
| A    | 20–24       |
| B    | 15–19       |
| C    | 10–14       |
| D    | 5–9         |
| F    | 0–4         |

The `TIER_SCORES` constant in `app.js` maps tier letters to display strings. The `tier` field in `data.json` is still set explicitly per board; there is no auto-calculation from a numeric score field.

## React App Structure (`js/app.js`)

Two components:

1. **`Modal`** — generic overlay; closes on backdrop click or ✕ button.
2. **`TierList`** — main component:
   - Fetches `data.json` on mount.
   - Filter buttons map display names → lowercase type values via `FILTER_MAPPING`.
   - Renders tier rows (S → D), each containing sorted item cards.
   - Clicking a card opens `Modal` with full board details.

### Tailwind Classes (Dead Code)

The JSX uses some Tailwind utility class names (`aspect-video`, `mb-4`,
`space-y-3`, `w-full`, `h-full`, `text-xl`, `font-bold`, etc.). **Tailwind is
not loaded.** These class names have no effect; layout is handled entirely by
`styles.css`. Do not add a Tailwind CDN link to fix this — instead, remove the
dead class names if tidying up the JSX.

## Conventions

### Language

Australian English in comments and documentation where the owner writes prose.

### Adding a New Board

1. Add the board image to `img/` (PNG preferred, square or near-square crop).
2. Add an entry to `data.json`:
   - Choose the correct `type` (case-sensitive).
   - Set `tier` and `tierPosition` consistently with neighbouring entries.
   - Use an absolute `imagePath` starting with `/img/`.
3. Commit and push — GitHub Actions deploys automatically.

### Git Workflow

- Work directly on `main` for content-only changes (data, images).
- Use a feature branch for structural or code changes.
- Commit messages should be descriptive; Conventional Commits format is welcome
  (`feat:`, `fix:`, `chore:`, `docs:`).

## Local Development

No build step required.

```bash
# Python (any version)
python -m http.server 8000
# Then visit http://localhost:8000
```

A local HTTP server is needed because `data.json` is fetched via `fetch()`,
which browsers block on `file://` URLs.

## Deployment

Cloudflare Pages with a custom domain:
1. Push to `main`.
2. Cloudflare Pages deploys automatically.
3. The custom domain is configured in the Cloudflare Pages dashboard and via the `CNAME` file.

## Known Quirks & Limitations

- **In-browser Babel** adds ~300 ms parse time on first load. Acceptable for a
  hobby site; would be unacceptable for a commercial product.
- **No F tier boards** currently in `data.json`, but the F tier row is always
  rendered (it will be empty).
- **Visitor badge** in `index.html` and `README.md` uses
  `visitor-badge.laobi.icu`, an external third-party service with no SLA.
- **`board-taxomomies`** — the linked GitHub repo name contains a deliberate
  typo. All links to it are correct as-is.
- **Tailwind dead classes** in JSX (see above).

## Current State

- **Status:** Live and functional.
- React upgraded to 18.3.1 (from 18.2.0); Babel upgraded to 7.26.10.
- F tier added (grey, score 0–4); score ranges displayed as subtitle on each tier label.
- Using `ReactDOM.createRoot` API (React 18 standard).
- Tier rows use `min-height` so they expand when a tier has many boards.
- `site.webmanifest` has correct name and dark `theme_color`/`background_color`.
- `index.html` has `<meta name="description">` and Open Graph / Twitter Card tags.

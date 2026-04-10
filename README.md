# Anime Next Watch Generator

Anime Next Watch Generator is a frontend web app that helps you discover currently airing anime and decide what to watch next.

The app fetches live data from the Jikan API (MyAnimeList unofficial API), then lets you search, filter, sort, and favorite titles in a responsive card layout.

## Live Demo

- GitHub Pages: https://dipu01-code.github.io/anime-next-watch-generator-apiproject/

## Features

- Fetches top airing anime from Jikan API
- Debounced title search (checks both default and English titles)
- Genre filter generated dynamically from fetched data
- Sorting options:
  - Title (A-Z / Z-A)
  - Score (High-Low / Low-High)
  - Year (Newest / Oldest)
- Pagination from API (`page` + `limit`) with incremental data loading
- Infinite scroll to auto-load more anime as you reach the bottom
- Throttled actions to prevent excessive repeated triggers
- Favorites system:
  - Add/remove favorites from each card
  - Show Favorites Only toggle
- Dark mode toggle
- Loading, empty-state, and error messages
- Refresh button to re-fetch latest data
- Progressive Web App (PWA) support:
  - Web app manifest
  - Service worker caching for app shell and API responses
  - Installable experience on supported devices

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Fetch API
- localStorage
- Service Worker API
- Web App Manifest

## API

- Provider: Jikan API
- Docs: https://docs.api.jikan.moe
- Endpoint used:

```text
https://api.jikan.moe/v4/top/anime?filter=airing&limit=24&page=1
```

## Bonus Features Implemented

- Debouncing: Search input updates are delayed briefly to reduce unnecessary re-renders.
- Throttling: Refresh and infinite-scroll triggers are rate-limited for smoother UX.
- Pagination: Data is fetched in pages and merged into local state.
- Loading Indicators: Existing loading state is shown during API requests.
- Local Storage: Favorites and dark mode persist between visits.
- Infinite Scroll: Additional pages are loaded when a sentinel enters viewport.
- PWA: Added `manifest.webmanifest`, `sw.js`, and service worker registration.

## Array Methods Used (Requirement)

Search/filter/sort logic is implemented with array methods:

- `filter()` for search and combined filtering
- `some()` for genre matching
- `sort()` for ordering
- `flatMap()`, `reduce()`, and `map()` for genre extraction and UI data shaping

## Project Structure

- `index.html` - Page structure, controls, card template
- `style.css` - Theme variables and responsive styling
- `script.js` - API calls, state, filtering/sorting, rendering, interactions
- `manifest.webmanifest` - PWA manifest metadata
- `sw.js` - Service worker for offline/app shell caching and API cache fallback
- `icon.svg` - App icon used by the web manifest
- `.github/workflows/deploy-pages.yml` - GitHub Pages CI/CD workflow

## Run Locally

1. Clone the repository.
2. Open the project folder.
3. Start a static server (pick one):
   - VS Code Live Server
   - `python -m http.server 5500`
4. Open the served URL in your browser.

## State Persistence

The app stores preferences in `localStorage`:

- `animeFavorites` for favorite anime IDs
- `animeDarkMode` for theme preference

## Deployment

This project includes GitHub Pages deployment through GitHub Actions.

- Workflow: `.github/workflows/deploy-pages.yml`
- Trigger: pushes to `main`

If GitHub Pages is not active in your repository settings, set the Pages source to GitHub Actions.

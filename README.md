# Anime Next Watch Generator

Anime Next Watch Generator is a responsive web app that helps users discover trending anime and choose what to watch next.

## Live Demo

- Production URL: https://dipu01-code.github.io/anime-next-watch-generator-apiproject/

## Final Milestone Features

- Live anime data from Jikan API
- Search by title (real-time)
- Filter by genre
- Sort by title, score, and year (ascending/descending)
- Favorite button per anime card
- Favorites-only toggle
- Dark mode / light mode toggle
- Loading and error states

## Requirement Compliance

Searching, filtering, and sorting are implemented with Array Higher-Order Functions:

- `filter()` for search + filter logic
- `some()` for genre match checks
- `sort()` for ordering results
- `flatMap()`, `reduce()`, and `map()` for genre and card data transformations

No traditional `for`/`while` loops are used for search/filter/sort operations.

## Refactor and Cleanup Summary

- Improved state handling with dedicated helper functions
- Reduced duplicate UI update logic
- Added localStorage persistence for:
  - Favorite anime IDs
  - Dark mode preference
- Kept code modular and easy to explain for class/demo use

## API Used

- API: Jikan (MyAnimeList unofficial API)
- Docs: https://docs.api.jikan.moe
- Endpoint: `https://api.jikan.moe/v4/top/anime?filter=airing&limit=24`

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Fetch API

## Project Structure

- `index.html` - Layout and app controls
- `style.css` - Styling and theme variables
- `script.js` - API fetch, state, search/filter/sort, rendering, interactions
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow

## Run Locally

1. Clone this repository.
2. Open the project folder.
3. Start any static server, for example:
   - VS Code Live Server, or
   - `python -m http.server 5500`
4. Open the local URL in your browser.

## Deployment

This project is deployed with GitHub Pages using GitHub Actions.

- Workflow file: `.github/workflows/deploy-pages.yml`
- Trigger: every push to `main`

If Pages is not active yet, open repository settings and set Pages source to GitHub Actions once.

# Anime Next Watch Generator

A web app that helps users quickly decide what anime to watch next by showing trending titles and allowing smart discovery with search.

## Project Purpose

This project is built for a JavaScript/API/UI milestone submission. It demonstrates:
- Public API integration using `fetch`
- Dynamic rendering of API data
- Simple and clean interface using CSS

## Public API Used

- API: Jikan (MyAnimeList unofficial API)
- Docs: https://docs.api.jikan.moe
- Endpoint used in this project:
  - `https://api.jikan.moe/v4/top/anime?filter=airing&limit=24`

## Core Features

- Trending anime list from live API data
- Search by anime title
- Filter by genre
- Expandable "Synopsis" section per card
- Loading state and error handling message

## Technologies

- HTML5
- CSS3 (custom styling + animations)
- Vanilla JavaScript (ES6+)
- Fetch API

## Project Structure

- `index.html` - App markup and UI containers
- `style.css` - Responsive design and visual styling
- `script.js` - API calls, search filtering, and rendering logic

## How to Run

1. Clone this repository.
2. Open the project folder.
3. Run with any static server, for example:
   - VS Code Live Server extension, or
   - `python -m http.server 5500`
4. Open the shown local URL in your browser.

## Milestone Mapping

### Milestone 1 (Planning)
- Project idea selected: Anime Next Watch Generator
- Public API selected: Jikan API
- Repository and README prepared

### Milestone 2 (API Integration)
- API calls implemented with `fetch`
- Data displayed dynamically on webpage
- Loading and error states handled
- Responsive behavior implemented for multiple device sizes

## Future Enhancements

- Add pagination / "Load More"
- Add favorites with localStorage
- Add trailer preview modal
- Add advanced filters (year, status, score range)

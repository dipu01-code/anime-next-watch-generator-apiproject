const API_URL = "https://api.jikan.moe/v4/top/anime?filter=airing&limit=24";

const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const statusBox = document.getElementById("status");
const animeGrid = document.getElementById("animeGrid");
const cardTemplate = document.getElementById("animeCardTemplate");

let sourceAnime = [];

function setLoadingState() {
    statusBox.innerHTML = '<div class="loader"><span></span><span></span><span></span></div> Loading trending anime...';
}

function setStatusMessage(message) {
    statusBox.textContent = message;
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function applySearchFilter() {
    const searchTerm = normalizeText(searchInput?.value);
    const filteredAnime = sourceAnime.filter((anime) => {
        const title = normalizeText(anime.title);
        return title.includes(searchTerm);
    });

    renderAnimeCards(filteredAnime);
}

function renderAnimeCards(animeList) {
    animeGrid.innerHTML = "";

    if (animeList.length === 0) {
        setStatusMessage("No anime data to display.");
        return;
    }

    const fragment = document.createDocumentFragment();

    animeList.forEach((anime) => {
        const cardNode = cardTemplate.content.cloneNode(true);
        const poster = cardNode.querySelector(".poster");
        const title = cardNode.querySelector(".title");
        const score = cardNode.querySelector(".score-pill");
        const episodes = cardNode.querySelector(".episodes");
        const year = cardNode.querySelector(".year");
        const genres = cardNode.querySelector(".genres");
        const synopsis = cardNode.querySelector(".synopsis");
        const detailsLink = cardNode.querySelector(".details-link");

        poster.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "";
        poster.alt = `${anime.title || "Anime"} poster`;

        title.textContent = anime.title || "Untitled";
        score.textContent = anime.score ? `Score ${anime.score}` : "Score N/A";
        episodes.textContent = `Episodes: ${anime.episodes || "?"}`;
        year.textContent = `Year: ${anime.year || "N/A"}`;
        genres.textContent = `Genres: ${(anime.genres || []).map((genre) => genre.name).join(", ") || "Unknown"}`;
        synopsis.textContent = anime.synopsis || "No synopsis available.";

        detailsLink.href = anime.url || "https://myanimelist.net/";
        detailsLink.textContent = "View on MyAnimeList";

        fragment.appendChild(cardNode);
    });

    animeGrid.appendChild(fragment);
    setStatusMessage(`Showing ${animeList.length} anime.`);
}

async function loadTrendingAnime() {
    setLoadingState();
    refreshBtn.disabled = true;

    try {
        const response = await fetch(API_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        sourceAnime = Array.isArray(payload.data) ? payload.data : [];

        if (sourceAnime.length === 0) {
            animeGrid.innerHTML = "";
            setStatusMessage("No anime data returned from API.");
            return;
        }

        applySearchFilter();
    } catch (error) {
        console.error(error);
        animeGrid.innerHTML = "";
        setStatusMessage("Could not load anime right now. Please try refresh.");
    } finally {
        refreshBtn.disabled = false;
    }
}

if (searchInput) {
    searchInput.addEventListener("input", applySearchFilter);
}
refreshBtn.addEventListener("click", loadTrendingAnime);

loadTrendingAnime();

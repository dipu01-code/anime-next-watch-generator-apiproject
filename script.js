const API_BASE_URL = "https://api.jikan.moe/v4/top/anime";
const PAGE_SIZE = 24;

const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const sortSelect = document.getElementById("sortSelect");
const favoritesOnlyBtn = document.getElementById("favoritesOnlyBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const refreshBtn = document.getElementById("refreshBtn");
const statusBox = document.getElementById("status");
const animeGrid = document.getElementById("animeGrid");
const cardTemplate = document.getElementById("animeCardTemplate");
const scrollSentinel = document.getElementById("scrollSentinel");
const STORAGE_KEYS = {
    favorites: "animeFavorites",
    darkMode: "animeDarkMode",
};

let sourceAnime = [];
const favoriteIds = new Set();
let showFavoritesOnly = false;
let isDarkMode = false;
let currentPage = 1;
let hasMorePages = true;
let isFetching = false;

function debounce(callback, delayMs) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delayMs);
    };
}

function throttle(callback, waitMs) {
    let lastRun = 0;
    let trailingTimeout;

    return (...args) => {
        const now = Date.now();
        const remaining = waitMs - (now - lastRun);

        if (remaining <= 0) {
            clearTimeout(trailingTimeout);
            trailingTimeout = null;
            lastRun = now;
            callback(...args);
            return;
        }

        if (!trailingTimeout) {
            trailingTimeout = setTimeout(() => {
                lastRun = Date.now();
                trailingTimeout = null;
                callback(...args);
            }, remaining);
        }
    };
}

function buildApiUrl(page) {
    const url = new URL(API_BASE_URL);
    url.searchParams.set("filter", "airing");
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("page", String(page));
    return url.toString();
}

function saveFavoriteState() {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...favoriteIds]));
}

function loadFavoriteState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.favorites);
        const parsed = JSON.parse(raw || "[]");

        if (Array.isArray(parsed)) {
            parsed.forEach((id) => favoriteIds.add(id));
        }
    } catch (error) {
        console.warn("Could not load favorites from storage.", error);
    }
}

function saveThemeState() {
    localStorage.setItem(STORAGE_KEYS.darkMode, String(isDarkMode));
}

function loadThemeState() {
    isDarkMode = localStorage.getItem(STORAGE_KEYS.darkMode) === "true";
}

function setLoadingState() {
    statusBox.innerHTML = '<div class="loader"><span></span><span></span><span></span></div> Loading trending anime...';
}

function setStatusMessage(message) {
    statusBox.textContent = message;
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function getAnimeId(anime) {
    return anime.mal_id;
}

function buildGenreOptions(animeList) {
    const currentSelection = genreFilter.value || "all";
    const uniqueGenres = animeList
        .flatMap((anime) => (anime.genres || []).map((genre) => genre.name))
        .filter(Boolean)
        .reduce((acc, genreName) => {
            if (!acc.includes(genreName)) {
                acc.push(genreName);
            }
            return acc;
        }, [])
        .sort((a, b) => a.localeCompare(b));

    genreFilter.innerHTML = '<option value="all">All Genres</option>';
    uniqueGenres.forEach((genreName) => {
        const option = document.createElement("option");
        option.value = genreName;
        option.textContent = genreName;
        genreFilter.appendChild(option);
    });

    genreFilter.value = uniqueGenres.includes(currentSelection) ? currentSelection : "all";
}

function updateFavoriteButton(button, animeId) {
    const isFavorite = favoriteIds.has(animeId);
    button.textContent = isFavorite ? "Remove Favorite" : "Add to Favorites";
    button.classList.toggle("active", isFavorite);
}

function sortAnime(animeList, sortBy) {
    const copy = [...animeList];

    const comparators = {
        "title-asc": (a, b) => normalizeText(a.title).localeCompare(normalizeText(b.title)),
        "title-desc": (a, b) => normalizeText(b.title).localeCompare(normalizeText(a.title)),
        "score-desc": (a, b) => (b.score || 0) - (a.score || 0),
        "score-asc": (a, b) => (a.score || 0) - (b.score || 0),
        "year-desc": (a, b) => (b.year || 0) - (a.year || 0),
        "year-asc": (a, b) => (a.year || 9999) - (b.year || 9999),
    };

    return copy.sort(comparators[sortBy] || comparators["title-asc"]);
}

function getVisibleAnime() {
    const searchTerm = normalizeText(searchInput?.value);
    const selectedGenre = genreFilter?.value || "all";
    const selectedSort = sortSelect?.value || "title-asc";

    const searched = sourceAnime.filter((anime) => {
        const title = normalizeText(anime.title);
        const englishTitle = normalizeText(anime.title_english);
        return title.includes(searchTerm) || englishTitle.includes(searchTerm);
    });

    const filtered = searched.filter((anime) => {
        const matchesGenre =
            selectedGenre === "all" || (anime.genres || []).some((genre) => genre.name === selectedGenre);
        const matchesFavorite = !showFavoritesOnly || favoriteIds.has(getAnimeId(anime));
        return matchesGenre && matchesFavorite;
    });

    return sortAnime(filtered, selectedSort);
}

function applyControls() {
    renderAnimeCards(getVisibleAnime());
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
        const favoriteBtn = cardNode.querySelector(".favorite-btn");
        const detailsLink = cardNode.querySelector(".details-link");

        poster.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "";
        poster.alt = `${anime.title || "Anime"} poster`;

        title.textContent = anime.title || "Untitled";
        score.textContent = anime.score ? `Score ${anime.score}` : "Score N/A";
        episodes.textContent = `Episodes: ${anime.episodes || "?"}`;
        year.textContent = `Year: ${anime.year || "N/A"}`;
        genres.textContent = `Genres: ${(anime.genres || []).map((genre) => genre.name).join(", ") || "Unknown"}`;
        synopsis.textContent = anime.synopsis || "No synopsis available.";

        const animeId = getAnimeId(anime);
        updateFavoriteButton(favoriteBtn, animeId);
        favoriteBtn.addEventListener("click", () => {
            if (favoriteIds.has(animeId)) {
                favoriteIds.delete(animeId);
            } else {
                favoriteIds.add(animeId);
            }
            saveFavoriteState();
            applyControls();
        });

        detailsLink.href = anime.url || "https://myanimelist.net/";
        detailsLink.textContent = "View on MyAnimeList";

        fragment.appendChild(cardNode);
    });

    animeGrid.appendChild(fragment);
    const loadedPages = Math.max(currentPage - 1, 1);
    const endOfListText = hasMorePages ? "" : " End of list reached.";
    setStatusMessage(`Showing ${animeList.length} anime. Loaded ${loadedPages} page(s).${endOfListText}`);
}

function mergeAnimePage(newItems) {
    const knownIds = new Set(sourceAnime.map(getAnimeId));
    const uniqueItems = newItems.filter((anime) => !knownIds.has(getAnimeId(anime)));
    sourceAnime = [...sourceAnime, ...uniqueItems];
    return uniqueItems.length;
}

async function loadTrendingAnime({ reset = false } = {}) {
    if (isFetching) {
        return;
    }

    if (reset) {
        sourceAnime = [];
        currentPage = 1;
        hasMorePages = true;
        animeGrid.innerHTML = "";
    }

    if (!hasMorePages) {
        return;
    }

    isFetching = true;
    setLoadingState();
    refreshBtn.disabled = true;

    try {
        const response = await fetch(buildApiUrl(currentPage), { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const pageItems = Array.isArray(payload.data) ? payload.data : [];

        if (pageItems.length === 0) {
            hasMorePages = false;

            if (sourceAnime.length === 0) {
                animeGrid.innerHTML = "";
                setStatusMessage("No anime data returned from API.");
            } else {
                applyControls();
            }
            return;
        }

        const addedCount = mergeAnimePage(pageItems);

        if (addedCount === 0) {
            hasMorePages = false;
        } else {
            currentPage += 1;
        }

        buildGenreOptions(sourceAnime);
        applyControls();
    } catch (error) {
        console.error(error);
        animeGrid.innerHTML = "";
        setStatusMessage("Could not load anime right now. Please try refresh.");
    } finally {
        isFetching = false;
        refreshBtn.disabled = false;
    }
}

function updateFavoritesOnlyLabel() {
    favoritesOnlyBtn.textContent = `Show Favorites Only: ${showFavoritesOnly ? "On" : "Off"}`;
}

function toggleFavoritesOnly() {
    showFavoritesOnly = !showFavoritesOnly;
    updateFavoritesOnlyLabel();
    applyControls();
}

function applyTheme() {
    document.body.classList.toggle("dark-mode", isDarkMode);
    themeToggleBtn.textContent = `Dark Mode: ${isDarkMode ? "On" : "Off"}`;
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    saveThemeState();
    applyTheme();
}

function setupInfiniteScroll() {
    if (!scrollSentinel || !("IntersectionObserver" in window)) {
        return;
    }

    const throttledLoadMore = throttle(() => {
        if (!showFavoritesOnly && hasMorePages && !isFetching) {
            loadTrendingAnime();
        }
    }, 800);

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                throttledLoadMore();
            }
        },
        {
            root: null,
            rootMargin: "350px 0px",
            threshold: 0,
        }
    );

    observer.observe(scrollSentinel);
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch((error) => {
            console.warn("Service worker registration failed.", error);
        });
    });
}

const debouncedApplyControls = debounce(applyControls, 250);
const throttledRefresh = throttle(() => loadTrendingAnime({ reset: true }), 1200);

if (searchInput) {
    searchInput.addEventListener("input", debouncedApplyControls);
}
if (genreFilter) {
    genreFilter.addEventListener("change", applyControls);
}
if (sortSelect) {
    sortSelect.addEventListener("change", applyControls);
}
if (favoritesOnlyBtn) {
    favoritesOnlyBtn.addEventListener("click", toggleFavoritesOnly);
}
if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
}
refreshBtn.addEventListener("click", throttledRefresh);

loadFavoriteState();
loadThemeState();
updateFavoritesOnlyLabel();
applyTheme();
setupInfiniteScroll();
registerServiceWorker();
loadTrendingAnime({ reset: true });

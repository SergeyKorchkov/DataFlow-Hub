const FALLBACK_MOVIES = [
  {
    id: 1,
    title: "Offline Cinema",
    overview: "Fallback movie feed while API is unavailable.",
    vote_average: 7.7,
    vote_count: 2100,
    release_date: "2024-01-05",
    poster_path: "",
    backdrop_path: "",
    genre_ids: [28, 878],
    popularity: 120,
  },
];

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const popularCache = new Map();
const genreCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

export const moviesService = {
  async getPopularMovies({ page = 1, language = "en-US", signal } = {}) {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    if (!apiKey) {
      return {
        page: 1,
        total_pages: 1,
        results: FALLBACK_MOVIES,
      };
    }

    const cacheKey = `${page}|${language}`;
    const cached = getCached(popularCache, cacheKey);

    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      api_key: apiKey,
      language,
      page: String(page),
    });

    const payload = await fetchJson(`${TMDB_BASE_URL}/movie/popular?${params.toString()}`, signal);

    const result = {
      page: payload.page || 1,
      total_pages: payload.total_pages || 1,
      results: Array.isArray(payload.results) ? payload.results : [],
    };

    setCached(popularCache, cacheKey, result);
    return result;
  },

  async getGenres({ language = "en-US", signal } = {}) {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    if (!apiKey) {
      return new Map();
    }

    const cacheKey = language;
    const cached = getCached(genreCache, cacheKey);

    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      api_key: apiKey,
      language,
    });

    const payload = await fetchJson(`${TMDB_BASE_URL}/genre/movie/list?${params.toString()}`, signal);
    const genres = Array.isArray(payload.genres) ? payload.genres : [];
    const genreMap = new Map(genres.map((genre) => [genre.id, genre.name]));

    setCached(genreCache, cacheKey, genreMap);
    return genreMap;
  },

  getPosterUrl(path, size = "w342") {
    return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : "";
  },

  getBackdropUrl(path) {
    return path ? `${TMDB_BACKDROP_BASE_URL}${path}` : "";
  },
};

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

function getCached(store, key) {
  const hit = store.get(key);

  if (!hit) {
    return null;
  }

  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }

  return hit.value;
}

function setCached(store, key, value) {
  store.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

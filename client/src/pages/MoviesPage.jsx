import { useEffect, useMemo, useRef, useState } from "react";
import { moviesService } from "../services/moviesService";

const MOVIES_GENRE_KEY = "movies_genre_pref";
const MOVIES_LANGUAGE = "en-US";

const INITIAL_RENDER_LIMIT = 20;
const RENDER_STEP = 12;

export function MoviesPage() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [movies, setMovies] = useState([]);
  const [genresMap, setGenresMap] = useState(new Map());
  const [selectedGenre, setSelectedGenre] = useState(() => localStorage.getItem(MOVIES_GENRE_KEY) || "all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [renderLimit, setRenderLimit] = useState(INITIAL_RENDER_LIMIT);

  const loadMoreRef = useRef(null);
  const loadMoreLockRef = useRef(false);

  const hasMorePages = page < totalPages;

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setTotalPages(1);
    setSelectedMovie(null);
    setSlideIndex(0);
    setRenderLimit(INITIAL_RENDER_LIMIT);
  }, []);

  useEffect(() => {
    setRenderLimit(INITIAL_RENDER_LIMIT);
  }, [selectedGenre]);

  useEffect(() => {
    localStorage.setItem(MOVIES_GENRE_KEY, selectedGenre);
  }, [selectedGenre]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGenres() {
      try {
        const genres = await moviesService.getGenres({ language: MOVIES_LANGUAGE, signal: controller.signal });
        setGenresMap(genres);
      } catch (err) {
        if (!controller.signal.aborted) {
          setGenresMap(new Map());
        }
      }
    }

    loadGenres();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovies() {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      setError("");

      try {
        const popular = await moviesService.getPopularMovies({ page, language: MOVIES_LANGUAGE, signal: controller.signal });

        if (popular.missingApiKey) {
          setError("Movies need VITE_TMDB_API_KEY in the Vercel environment variables.");
          setMovies([]);
          setTotalPages(1);
          return;
        }

        const incoming = popular.results || [];

        setMovies((prev) => {
          const next = page === 1 ? incoming : [...prev, ...incoming];
          return dedupeById(next);
        });
        setTotalPages(Math.min(popular.total_pages || 1, 500));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to load movies from TMDB.");
          if (page === 1) {
            setMovies([]);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    }

    loadMovies();

    return () => controller.abort();
  }, [page]);

  const trendingSlides = useMemo(() => movies.slice(0, 5), [movies]);
  const featured = trendingSlides[slideIndex] || movies[0] || null;

  const visibleMovies = useMemo(() => {
    if (selectedGenre === "all") {
      return movies;
    }

    return movies.filter((movie) => movie.genre_ids?.includes(Number(selectedGenre)));
  }, [movies, selectedGenre]);

  const renderedMovies = useMemo(
    () => visibleMovies.slice(0, Math.min(renderLimit, visibleMovies.length)),
    [visibleMovies, renderLimit]
  );

  const canRenderMoreLocal = renderLimit < visibleMovies.length;

  const genreOptions = useMemo(() => {
    const entries = Array.from(genresMap.entries());
    return entries.slice(0, 10);
  }, [genresMap]);

  useEffect(() => {
    if (trendingSlides.length <= 1) {
      setSlideProgress(100);
      return undefined;
    }

    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % trendingSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [trendingSlides.length]);

  useEffect(() => {
    if (trendingSlides.length <= 1) {
      setSlideProgress(100);
      return undefined;
    }

    setSlideProgress(0);
    const durationMs = 5000;
    const stepMs = 60;
    const tick = (100 * stepMs) / durationMs;

    const timer = setInterval(() => {
      setSlideProgress((prev) => Math.min(100, prev + tick));
    }, stepMs);

    return () => clearInterval(timer);
  }, [slideIndex, trendingSlides.length]);

  useEffect(() => {
    if (trendingSlides.length <= 1) {
      return;
    }

    const nextIndex = (slideIndex + 1) % trendingSlides.length;
    const nextBackdrop = moviesService.getBackdropUrl(trendingSlides[nextIndex]?.backdrop_path);

    if (!nextBackdrop) {
      return;
    }

    const image = new Image();
    image.src = nextBackdrop;
  }, [slideIndex, trendingSlides]);

  useEffect(() => {
    if (slideIndex >= trendingSlides.length) {
      setSlideIndex(0);
    }
  }, [slideIndex, trendingSlides.length]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node || isLoading || isFetchingMore || (!hasMorePages && !canRenderMoreLocal)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadMoreLockRef.current) {
          return;
        }

        loadMoreLockRef.current = true;

        if (canRenderMoreLocal) {
          setRenderLimit((prev) => prev + RENDER_STEP);
          requestAnimationFrame(() => {
            loadMoreLockRef.current = false;
          });
          return;
        }

        if (hasMorePages) {
          setPage((prev) => Math.min(prev + 1, totalPages));
          setTimeout(() => {
            loadMoreLockRef.current = false;
          }, 250);
          return;
        }

        loadMoreLockRef.current = false;
      },
      { rootMargin: "180px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [canRenderMoreLocal, hasMorePages, isFetchingMore, isLoading, totalPages]);

  useEffect(() => {
    if (renderLimit > visibleMovies.length && visibleMovies.length > 0) {
      setRenderLimit(visibleMovies.length);
    }
  }, [renderLimit, visibleMovies.length]);

  useEffect(() => {
    function onEsc(event) {
      if (event.key === "Escape") {
        setSelectedMovie(null);
      }
    }

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="space-y-7 rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_top_right,_rgba(147,51,234,0.28),_transparent_38%),radial-gradient(circle_at_20%_75%,_rgba(14,165,233,0.2),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_70%,_#111827_100%)] p-6 md:p-8 shadow-2xl">
      <section className="rounded-2xl border border-violet-300/20 bg-gradient-to-r from-slate-900/80 via-violet-950/50 to-slate-900/80 p-8 text-white">
        <p className="mb-3 inline-flex rounded-full border border-violet-300/40 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
          TMDB Live Feed
        </p>
        <h1 className="text-4xl font-extrabold md:text-5xl">Cinema Explorer</h1>
        <p className="mt-2 text-slate-300 text-lg">Popular movies with real posters, ratings, and dynamic genres.</p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-300">
          Language: EN
        </div>

        <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Visible: {renderedMovies.length} / {visibleMovies.length}</div>
      </section>

      {featured ? (
        <section className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">Now Trending</div>
          <section
            className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 min-h-[340px]"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedMovie(featured)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                setSelectedMovie(featured);
              }
            }}
          >
            {trendingSlides.map((movie, idx) => {
              const backdrop = moviesService.getBackdropUrl(movie.backdrop_path);
              const active = idx === slideIndex;

              return (
                <div
                  key={movie.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    active ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
                  }`}
                >
                  {backdrop ? (
                    <img src={backdrop} alt={movie.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-900" />
                  )}
                </div>
              );
            })}

            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />

            <div className="relative z-10 p-6 md:p-8 max-w-2xl">
              <p className="text-violet-200 text-xs uppercase tracking-[0.2em]">Featured</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">{featured.title}</h2>
              <p className="mt-3 text-slate-200 line-clamp-3">{featured.overview || "No overview available."}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 font-semibold text-amber-200">
                  ⭐ {Number(featured.vote_average || 0).toFixed(1)}
                </span>
                <span className="rounded-full border border-sky-300/40 bg-sky-400/15 px-3 py-1 font-semibold text-sky-200">
                  👥 {(featured.vote_count || 0).toLocaleString()} votes
                </span>
                <span className="rounded-full border border-slate-300/30 bg-slate-200/10 px-3 py-1 font-semibold text-slate-100">
                  📅 {featured.release_date || "Unknown"}
                </span>
              </div>
            </div>

            <div className="absolute bottom-5 right-5 flex gap-1.5">
              {trendingSlides.map((movie, idx) => (
                <button
                  key={`trend-dot-${movie.id}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSlideIndex(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all ${idx === slideIndex ? "w-8 bg-violet-300" : "w-2.5 bg-slate-200/50"}`}
                  aria-label={`Trending slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="absolute left-0 right-0 top-0 h-1 bg-black/30">
              <div className="h-full bg-violet-300/90 transition-[width] duration-75" style={{ width: `${slideProgress}%` }} />
            </div>
          </section>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
        <div className="mb-3 text-xs uppercase tracking-[0.15em] text-slate-400">Genre Filter</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedGenre("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selectedGenre === "all"
                ? "bg-cyan-300 text-slate-950"
                : "bg-slate-800 text-slate-300 border border-slate-600 hover:text-cyan-200"
            }`}
          >
            All
          </button>
          {genreOptions.map(([id, name]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedGenre(String(id))}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                selectedGenre === String(id)
                  ? "bg-violet-300 text-slate-950"
                  : "bg-slate-800 text-slate-300 border border-slate-600 hover:text-violet-200"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              <div className="h-56 rounded-lg bg-slate-700/60" />
              <div className="mt-3 h-3 rounded bg-slate-700/60" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-700/50" />
            </div>
          ))}
        </section>
      ) : null}

      {error ? (
        <section className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">{error}</section>
      ) : null}

      {!isLoading ? (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {renderedMovies.map((movie) => {
            const poster = moviesService.getPosterUrl(movie.poster_path, "w342");
            const genres = (movie.genre_ids || []).map((id) => genresMap.get(id)).filter(Boolean).slice(0, 2);

            return (
              <article
                key={movie.id}
                className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-900/60 transition hover:-translate-y-0.5 hover:border-violet-300/40 hover:shadow-[0_10px_22px_rgba(139,92,246,0.18)]"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMovie(movie)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedMovie(movie);
                  }
                }}
              >
                <div className="relative h-64 overflow-hidden">
                  {poster ? (
                    <img
                      src={poster}
                      alt={movie.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300">No Poster</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-slate-100">{movie.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                    <span>⭐ {Number(movie.vote_average || 0).toFixed(1)}</span>
                    <span>{movie.release_date ? String(movie.release_date).slice(0, 4) : "----"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {genres.length > 0 ? genres.map((genre) => (
                      <span key={`${movie.id}-${genre}`} className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-200">
                        {genre}
                      </span>
                    )) : (
                      <span className="rounded-full bg-slate-700/70 px-2 py-0.5 text-[10px] font-semibold text-slate-300">Genre N/A</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      <div ref={loadMoreRef} className="h-10" />

      {isFetchingMore ? (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={`more-${idx}`} className="animate-pulse rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              <div className="h-56 rounded-lg bg-slate-700/60" />
              <div className="mt-3 h-3 rounded bg-slate-700/60" />
            </div>
          ))}
        </section>
      ) : null}

      {canRenderMoreLocal && !isFetchingMore ? (
        <p className="pt-2 text-center text-xs uppercase tracking-[0.2em] text-slate-500">Loading more cards as you scroll...</p>
      ) : null}

      {!hasMorePages && movies.length > 0 ? (
        <p className="pt-2 text-center text-xs uppercase tracking-[0.2em] text-slate-500">You reached the end of the feed</p>
      ) : null}

      {selectedMovie ? (
        <MovieModal movie={selectedMovie} genresMap={genresMap} onClose={() => setSelectedMovie(null)} />
      ) : null}
    </div>
  );
}

function MovieModal({ movie, genresMap, onClose }) {
  const poster = moviesService.getPosterUrl(movie.poster_path);
  const backdrop = moviesService.getBackdropUrl(movie.backdrop_path);
  const genres = (movie.genre_ids || []).map((id) => genresMap.get(id)).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-56 md:h-72">
          {backdrop ? <img src={backdrop} alt={movie.title} className="h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg border border-slate-400/50 bg-black/40 px-3 py-1 text-sm font-semibold text-slate-100"
          >
            Close
          </button>
          <div className="absolute bottom-0 left-0 p-5 md:p-6">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">{movie.title}</h3>
            <p className="mt-2 text-sm text-slate-200">{movie.release_date || "Unknown release date"}</p>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[180px_1fr] md:p-6">
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
            {poster ? (
              <img src={poster} alt={movie.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center text-slate-400">No Poster</div>
            )}
          </div>

          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">
                ⭐ {Number(movie.vote_average || 0).toFixed(1)}
              </span>
              <span className="rounded-full border border-sky-300/40 bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-200">
                👥 {(movie.vote_count || 0).toLocaleString()} votes
              </span>
              <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-400/15 px-3 py-1 text-xs font-semibold text-fuchsia-200">
                🔥 Popularity {Number(movie.popularity || 0).toFixed(0)}
              </span>
            </div>

            <p className="text-slate-200">{movie.overview || "No overview available for this movie."}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {genres.length > 0 ? (
                genres.map((genre) => (
                  <span key={`${movie.id}-${genre}`} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200">
                    {genre}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">Genre not specified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function dedupeById(list) {
  const seen = new Set();

  return list.filter((item) => {
    if (!item || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

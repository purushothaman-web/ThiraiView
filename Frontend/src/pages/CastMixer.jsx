import React, { useState, useEffect } from "react";
import apiClient from "../api/axiosInstance";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X, Users, Play, Loader, Plus } from "lucide-react";
import { MovieCardSkeleton } from "../components/Skeleton";

const CastMixer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]); // Search results
  const [selectedCast, setSelectedCast] = useState([]); // Selected actors
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load initial cast from URL
  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      // We need to fetch details for these IDs to show their names
      // For now, we might need a way to get person details by ID, or just fetch movies
      // Let's just fetch movies first. We can't easily get names without another endpoint or bulk fetch.
      // To keep it simple, we will fetch movies immediately.
      fetchMovies(ids);
      
      // OPTIONAL: If we want to show the pills, we'd need to fetch person details.
      // For this MVP, if IDs are present but no selectedCast state, we might miss the pills names.
      // Let's rely on the user adding them or just show movies. 
      // Actually, let's try to fetch person details if possible? 
      // Catalog service doesn't have getPerson(id). 
      // We will skip pre-populating pills from *just* IDs for now, unless we pass names in URL too?
      // Better: When navigating from MovieDetail, we can pass state!
    } else {
        // No IDs
    }
  }, [searchParams]);

  // Sync selectedCast to URL? Maybe not strictly necessary for MVP, but good practice.
  // Let's trigger search when selectedCast changes.
  useEffect(() => {
    if (selectedCast.length > 0) {
      const ids = selectedCast.map(c => c.id).join(",");
      fetchMovies(ids);
      setSearchParams({ ids });
      setSearchParams({});
    }
  }, [selectedCast, setSearchParams]);

  const searchActors = async (e) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length > 2) {
      try {
        const res = await apiClient.get(`/catalog/people/search`, { params: { q } });
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setResults([]);
    }
  };

  const addActor = (actor) => {
    if (!selectedCast.find(c => c.id === actor.id)) {
      setSelectedCast([...selectedCast, actor]);
    }
    setQuery("");
    setResults([]);
  };

  const removeActor = (id) => {
    setSelectedCast(selectedCast.filter(c => c.id !== id));
  };

  const fetchMovies = async (ids) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/catalog/discover/cast`, { params: { ids } });
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-black min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase tracking-tight">
            Cast <span className="text-brand-yellow">Mixer</span>
          </h1>
          <p className="text-gray-400 text-lg">Mix and match actors to find their movies.</p>
        </div>

        {/* Caster Controls */}
        <div className="bg-brand-gray rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-800 max-w-3xl mx-auto mb-16 relative z-10">
          
          {/* Search Input */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-gray-500" />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={searchActors}
              placeholder="Search for an actor (e.g. Tom Hanks)..."
              className="w-full bg-black/40 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
            />
            {/* Dropdown */}
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50">
                {results.map(person => (
                  <button
                    key={person.id}
                    onClick={() => addActor(person)}
                    className="w-full text-left p-3 hover:bg-white/10 flex items-center gap-3 transition-colors border-b border-gray-800 last:border-0"
                  >
                     {person.profilePath ? (
                       <img src={`https://image.tmdb.org/t/p/w45${person.profilePath}`} alt={person.name} className="w-10 h-10 rounded-full object-cover" />
                     ) : (
                       <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">{person.name.charAt(0)}</div>
                     )}
                     <div>
                       <p className="font-bold text-gray-200">{person.name}</p>
                       <p className="text-xs text-gray-500 truncate w-64">{person.knownFor}</p>
                     </div>
                     <Plus size={16} className="ml-auto text-brand-yellow" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Pills */}
          <div className="flex flex-wrap gap-3 min-h-[50px]">
            {selectedCast.length === 0 && (
              <p className="text-gray-500 italic text-sm w-full text-center py-2">No actors selected. Start typing to add.</p>
            )}
            {selectedCast.map(actor => (
              <div key={actor.id} className="flex items-center gap-2 bg-brand-yellow/10 border border-brand-yellow/30 pl-2 pr-3 py-1.5 rounded-full animate-fade-in">
                 {actor.profilePath && <img src={`https://image.tmdb.org/t/p/w45${actor.profilePath}`} alt="" className="w-6 h-6 rounded-full object-cover" />}
                 <span className="text-brand-yellow font-bold text-sm">{actor.name}</span>
                 <button onClick={() => removeActor(actor.id)} className="hover:bg-brand-yellow/20 p-1 rounded-full text-brand-yellow transition-colors"><X size={14} /></button>
              </div>
            ))}
          </div>

        </div>

        {/* Results */}
        {loading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {Array(10).fill(0).map((_, i) => <MovieCardSkeleton key={i} />)}
             </div>
        ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in-up">
              {movies.map((movie, index) => (
                <Link
                  key={movie.sourceId}
                  to={`/movies/${movie.sourceId}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="group relative bg-brand-gray rounded-xl overflow-hidden shadow-xl border border-gray-800 hover:border-brand-yellow/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-900/10 fill-mode-both"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-gray-900 relative">
                    <img
                      src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder-poster.png"}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                       <Play className="text-brand-yellow fill-brand-yellow drop-shadow-lg" size={40} />
                    </div>
                  </div>
                  <div className="p-4">
                     <h3 className="font-bold text-white line-clamp-1 group-hover:text-brand-yellow transition-colors text-lg">{movie.title}</h3>
                     <p className="text-sm text-gray-500 font-medium mt-1">{movie.releaseDate?.split("-")[0]}</p>
                  </div>
                </Link>
              ))}
            </div>
        )}
        
        {!loading && movies.length === 0 && selectedCast.length > 0 && (
             <div className="text-center py-20">
                <Users className="mx-auto h-16 w-16 text-gray-700 mb-4" />
                <p className="text-gray-500 text-xl font-medium">No movies found with this specific combination.</p>
                <p className="text-gray-600 mt-2">Try removing some actors.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default CastMixer;

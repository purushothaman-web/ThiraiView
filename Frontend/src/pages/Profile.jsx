import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [movies, setMovies] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [moviesCount, setMoviesCount] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch profile (supports viewing another user via ?userId=)
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const userId = searchParams.get('userId');
        const url = userId ? `${BASE_URL}/profile/other/${userId}` : `${BASE_URL}/profile`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          // show inline message instead of alert
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load profile.");
        }
      }
    };

    fetchProfile();
    // Preload counts for tabs so labels show immediately
    const preloadCounts = async () => {
      try {
        const [r, m] = await Promise.all([
          axios.get(`${BASE_URL}/profile/reviews`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/profile/movies`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setReviewsCount(Array.isArray(r.data) ? r.data.length : 0);
        setMoviesCount(Array.isArray(m.data) ? m.data.length : 0);
      } catch (_) {
        // ignore
      }
    };
    preloadCounts();
  }, [token,navigate]);

  // Fetch reviews, watchlist, movies when activeTab changes (own data only)
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        if (activeTab === "reviews") {
          const res = await axios.get(`${BASE_URL}/profile/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setReviews(res.data);
        } else if (activeTab === "watchlist") {
          const res = await axios.get(`${BASE_URL}/profile/watchlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setWatchlist(res.data);
        } else if (activeTab === "movies") {
          const res = await axios.get(`${BASE_URL}/profile/movies`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMovies(res.data);
        }
      } catch (err) {
        console.error(err);
        setError(`Failed to load ${activeTab}`);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== "profile") fetchData();
  }, [activeTab, token]);

  if (!user) return <p>Loading profile...</p>;

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "reviews", label: `Reviews (${reviewsCount || reviews.length})` },
    { id: "watchlist", label: `Watchlist (${user.watchlistCount ?? 0})` },
    { id: "movies", label: `Movies (${moviesCount || movies.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <aside className="md:col-span-1" style={{ display: 'flex', alignItems: 'center' }}>
          <ProfileSummary user={user} reviewsCount={reviewsCount} moviesCount={moviesCount} />
        </aside>

        {/* Right: Tabs and content */}
        <section className="md:col-span-2">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 ">Dashboard</h1>

          <div className="flex overflow-x-auto no-scrollbar mb-4 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 mr-4 whitespace-nowrap border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-blue-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {error && (
              <p className="text-red-600 mb-4 text-center font-medium p-3 bg-red-50 rounded-lg border border-red-200">{error}</p>
            )}

            {loading && <p className="text-center text-gray-600">Loading {activeTab}...</p>}

            {!loading && activeTab === "profile" && (
                <ProfileView user={user} reviewsCount={reviewsCount} moviesCount={moviesCount} />
            )}

            {!loading && activeTab === "reviews" && (
              <ReviewsView reviews={reviews} />
            )}

            {!loading && activeTab === "watchlist" && (
              <WatchlistView watchlist={watchlist} />
            )}

            {!loading && activeTab === "movies" && <MoviesView movies={movies} />}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileSummary({ user, reviewsCount, moviesCount }) {
  const pictureSrc = (() => {
    const raw = user.profilePicture || "";
    if (!raw) return null;
    const normalized = raw.replace(/\\/g, "/");
    if (/^https?:\/\//.test(normalized)) return normalized;
    const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${BASE_URL}${path}`;
  })();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center flex flex-col justify-center">
      {pictureSrc && (
        <img
          src={pictureSrc}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover mx-auto mb-3 border-2 border-gray-300"
        />
      )}
      <div className="text-xl font-semibold text-gray-900">{user.name}</div>
      <div className="text-gray-600">@{user.username}</div>
      <div className="text-gray-500 text-sm mt-1">{user.email}</div>
      {user.bio && <p className="mt-3 text-sm text-gray-700 ">{user.bio}</p>}
      <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto text-sm">
        <div className="p-2 rounded-lg border border-gray-200 bg-gray-50">
          <div className="text-gray-500">Watchlist</div>
          <div className="font-semibold text-gray-900">{user.watchlistCount ?? 0}</div>
        </div>
        <div className="p-2 rounded-lg border border-gray-200 bg-gray-50">
          <div className="text-gray-500">Reviews</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
  {reviewsCount ?? '-'}  Reviews
</div>

        </div>

        <div className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-400">Movies</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">{moviesCount ?? '-'}</div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ user, reviewsCount, moviesCount }) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const pictureSrc = (() => {
    const raw = user.profilePicture || "";
    if (!raw) return null;
    const normalized = raw.replace(/\\/g, "/");
    if (/^https?:\/\//.test(normalized)) return normalized;
    const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${BASE_URL}${path}`;
  })();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      if (username) form.append("username", username.trim());
      if (bio) form.append("bio", bio);
      if (file) form.append("profilePicture", file);
      await axios.put(`${BASE_URL}/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      // show inline
      // eslint-disable-next-line no-console
      console.error(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // We'll surface a general form error via setError from parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-center">
      {pictureSrc && (
        <img
          src={pictureSrc}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-2 border-gray-300"
        />
      )}
      <h2 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-gray-100">{user.name}</h2>

      <p className="text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
      {user.bio && (
        <p className="italic text-gray-700 dark:text-gray-300 max-w-xl mx-auto">{user.bio}</p>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto text-sm">
        <div className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-400">Watchlist</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">{user.watchlistCount ?? 0}</div>
        </div>
        <div className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      <div className="text-gray-500 dark:text-gray-400">Reviews</div>
      <div className="font-semibold text-gray-900 dark:text-gray-100">{reviewsCount ?? '-'}</div>
    </div>
    <div className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      <div className="text-gray-500 dark:text-gray-400">Movies</div>
      <div className="font-semibold text-gray-900 dark:text-gray-100">{moviesCount ?? '-'}</div>
    </div>
      </div>

      <div className="mt-6">
        {!isEditing ? (
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium" onClick={() => setIsEditing(true)}>Edit Profile</button>
        ) : (
            <form onSubmit={onSubmit} className="max-w-md mx-auto text-left bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100 font-medium">Username</label>
            <input className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200" value={username} onChange={(e) => setUsername(e.target.value)} />
            <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100 font-medium">Bio</label>
            <textarea className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200" rows="3" value={bio} onChange={(e) => setBio(e.target.value)} />
            <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100 font-medium">Profile Picture</label>
            <input type="file" accept="image/png, image/jpeg, image/webp" className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => setFile(e.target.files[0])} />
            <div className="flex gap-3">
              <button disabled={saving} type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              <button type="button" className="px-6 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ReviewsView({ reviews }) {
  if (reviews.length === 0)
    return <p className="text-center text-gray-500 dark:text-gray-400">No reviews found.</p>;

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="border border-gray-200 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <Link to={`/movies/${review.movie?.id ?? review.movieId}`}>
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {review.movie?.title ?? review.movieTitle}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Rating: {review.rating} / 5
            </p>
            <p className="text-gray-900 dark:text-gray-100">{review.content ?? review.comment}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function WatchlistView({ watchlist }) {
  if (watchlist.length === 0)
    return <p className="text-center text-gray-500 dark:text-gray-400">Your watchlist is empty.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {watchlist.map(({ id, movie }) => (
        <Link
          key={id}
          to={`/movies/${movie.id}`}
          className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <img
            src={`${BASE_URL}${movie.poster}`}
            alt={movie.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-3">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {movie.year} — {movie.director}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MoviesView({ movies }) {
  if (movies.length === 0)
    return <p className="text-center text-gray-500 dark:text-gray-400">No movies found.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {movies.map((movie) => (
        <Link
          key={movie.id}
          to={`/movies/${movie.id}`}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <img
            src={`${BASE_URL}${movie.poster}`}
            alt={movie.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-3">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {movie.year} — {movie.director}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

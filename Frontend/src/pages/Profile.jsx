import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAxios } from "../api/axiosInstance";
import ReviewsView from "../components/profile/ReviewsView";
import MoviesView from "../components/profile/MoviesView";
import WatchlistView from "../components/profile/WatchlistView";

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

  const api = useAxios();
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
        const url = userId ? `/profile/other/${userId}` : `/profile`;
        const res = await api.get(url);
        setUser(res.data);
      } catch (err) {
        console.error(err);
        // Interceptor handles 401/refresh.
        // If it fails after retry, it calls logout().
        // We just handle visible errors here for other errors.
        if (err.response?.status !== 401) {
          setError("Failed to load profile.");
        }
      }
    };

    fetchProfile();
    // Preload counts for tabs so labels show immediately
    const preloadCounts = async () => {
      try {
        const [r, m] = await Promise.all([
          api.get(`/profile/reviews`),
          api.get(`/profile/movies`),
        ]);
        setReviewsCount(Array.isArray(r.data) ? r.data.length : 0);
        setMoviesCount(Array.isArray(m.data) ? m.data.length : 0);
      } catch (_) {
        // ignore
      }
    };
    preloadCounts();
  }, [navigate, searchParams, token]); // removed api to prevent infinite loop

  // Fetch reviews, watchlist, movies when activeTab changes (own data only)
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        if (activeTab === "reviews") {
          const res = await api.get(`/profile/reviews`);
          setReviews(res.data);
        } else if (activeTab === "watchlist") {
          const res = await api.get(`/profile/watchlist`);
          setWatchlist(res.data);
        } else if (activeTab === "movies") {
          const res = await api.get(`/profile/movies`);
          setMovies(res.data);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status !== 401) {
          setError(`Failed to load ${activeTab}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== "profile") fetchData();
  }, [activeTab, token]);

  if (!user) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "reviews", label: `Reviews (${reviewsCount || reviews.length})` },
    { id: "watchlist", label: `Watchlist (${user.watchlistCount ?? 0})` },
    { id: "movies", label: `My Movies (${moviesCount || movies.length})` },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-center">
        {/* Left: Profile card */}
        <aside className="lg:col-span-4 xl:col-span-3 w-full max-w-md mx-auto lg:max-w-none">
          <ProfileSummary user={user} reviewsCount={reviewsCount} moviesCount={moviesCount} />
        </aside>

        {/* Right: Tabs and content */}
        <section className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 pb-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Dashboard
            </h1>

            <div className="flex no-scrollbar gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-2 whitespace-nowrap text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === tab.id
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 translate-y-[1px]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 min-h-[400px]">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center justify-center">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-4 w-4 bg-gray-200 rounded-full mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading content...</p>
                </div>
              </div>
            )}

            {!loading && (
              <div className="animate-fadeIn">
                {activeTab === "profile" && (
                  <ProfileView user={user} reviewsCount={reviewsCount} moviesCount={moviesCount} />
                )}

                {activeTab === "reviews" && (
                  <ReviewsView reviews={reviews} />
                )}

                {activeTab === "watchlist" && (
                  <WatchlistView watchlist={watchlist} />
                )}

                {activeTab === "movies" && <MoviesView movies={movies} />}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileSummary({ user, reviewsCount, moviesCount }) {
  const pictureSrc = (() => {
    const raw = user.profilePicture || "";
    if (!raw) return `https://ui-avatars.com/api/?name=${user.name.replace(" ", "+")}&background=0D8ABC&color=fff&size=256`; // Default to UI Avatars with brand color
    const normalized = raw.replace(/\\/g, "/");
    if (/^https?:\/\//.test(normalized)) return normalized;
    const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${BASE_URL}${path}`;
  })();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <div className="px-6 pb-6 text-center -mt-16">
        <div className="relative inline-block">
          <img
            src={pictureSrc}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md bg-white"
          />
          {user.isVerified && (
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm" title="Verified User">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{user.name}</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">@{user.username}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-semibold rounded-full uppercase tracking-wide">
            {user.role || 'Member'}
          </span>
        </div>

        {user.bio && <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{user.bio}</p>}

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{user.followersCount || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Followers</div>
          </div>
          <div className="text-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{user.followingCount || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Following</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Avatar Set (Movie Themed / Character Styles)
const MOVIE_AVATARS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=ActionHero",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=SciFiPilot",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Detector",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Villain",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=ComedyKing",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=DramaQueen",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Director",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Stuntman",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Sidekick",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Slasher",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=RomCom",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Indie",
];

function ProfileView({ user, reviewsCount, moviesCount }) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user.profilePicture);
  const [saving, setSaving] = useState(false);
  const api = useAxios();

  const pictureSrc = (() => {
    // If we have a selected avatar state, show that (preview)
    // Otherwise show user's current
    const current = selectedAvatar || user.profilePicture || "";
    if (!current) return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(user.name || 'user')}`;

    // Check if it's a URL
    if (current.startsWith('http')) return current;

    // Handle relative paths
    const normalized = current.replace(/\\/g, "/");
    const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

    // Strip /api from BASE_URL if targeting static files (uploads)
    const rootUrl = (BASE_URL || 'http://localhost:3000').replace(/\/api$/, '').replace(/\/$/, '');

    return `${rootUrl}${path}`;
  })();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Use FormData to handle both potential future file uploads or text fields
      const form = new FormData();
      if (username) form.append("username", username.trim());
      if (bio) form.append("bio", bio);

      // If selectedAvatar is one of our URLs, send it as a string
      // If it's the original user profile picture (and hasn't changed), we don't strictly need to send it, 
      // but sending it ensures it stays.
      if (selectedAvatar && selectedAvatar !== user.profilePicture) {
        form.append("profilePicture", selectedAvatar);
      }

      await api.put(`/profile`, form);
      window.location.reload();
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-center">
      <div className="relative inline-block mb-4">
        <img
          src={pictureSrc}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md bg-white"
        />
      </div>

      {!isEditing ? (
        <>
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
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        </>
      ) : (
        <form onSubmit={onSubmit} className="max-w-xl mx-auto text-left bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mt-6 animate-fadeIn">

          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Edit Details</h3>

          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100 font-medium">Username</label>
            <input className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-1 text-gray-900 dark:text-gray-100 font-medium">Bio</label>
            <textarea className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium" rows="3" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-3 text-gray-900 dark:text-gray-100 font-medium">Choose Avatar</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {MOVIE_AVATARS.map((avatarUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all duration-200 ${selectedAvatar === avatarUrl
                    ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 scale-110"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:scale-105"
                    }`}
                >
                  <img src={avatarUrl} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover bg-gray-100 dark:bg-gray-800" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors duration-200 font-medium" onClick={() => setIsEditing(false)}>Cancel</button>
            <button disabled={saving} type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

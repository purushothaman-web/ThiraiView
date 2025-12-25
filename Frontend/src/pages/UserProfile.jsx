import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ReviewsView from "../components/profile/ReviewsView";
import MoviesView from "../components/profile/MoviesView";
import WatchlistView from "../components/profile/WatchlistView";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Current logged in user (to show/hide follow button)
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${BASE_URL}/profile/${id}`, { headers });
        setUser(res.data);
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load user");
      }
    };
    fetchUser();
  }, [id, token]);

  // Fetch tab data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "reviews") {
          const res = await axios.get(`${BASE_URL}/profile/${id}/reviews`);
          setReviews(res.data);
        } else if (activeTab === "movies") {
          const res = await axios.get(`${BASE_URL}/profile/${id}/movies`);
          setMovies(res.data);
        } else if (activeTab === "watchlist") {
          const res = await axios.get(`${BASE_URL}/profile/${id}/watchlist`);
          setWatchlist(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== "profile") fetchData();
  }, [activeTab, id]);

  const handleFollowToggle = async () => {
    if (!token) {
      alert("Please login to follow users.");
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`${BASE_URL}/follow/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(false);
        setUser(prev => ({ ...prev, followersCount: Math.max(0, (prev.followersCount || 1) - 1) }));
      } else {
        await axios.post(`${BASE_URL}/follow/user/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(true);
        setUser(prev => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }));
      }
    } catch (err) {
      console.error(err);
      alert("Action failed. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };


  if (error) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
    </div>
  );

  if (!user) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "reviews", label: `Reviews (${user.reviewsCount || 0})` },
    { id: "watchlist", label: `Watchlist (${user.watchlistCount || 0})` },
    { id: "movies", label: `Movies Added (${user.moviesCount || 0})` },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Public Profile Summary */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <PublicProfileSummary
            user={user}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onFollowToggle={handleFollowToggle}
            isAuthenticated={!!token}
          />
        </aside>

        {/* Right: Content */}
        <section className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 pb-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex overflow-x-auto no-scrollbar gap-6">
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
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-4 w-4 bg-gray-200 rounded-full mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading user content...</p>
                </div>
              </div>
            )}

            {!loading && (
              <div className="animate-fadeIn">
                {activeTab === "profile" && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">About {user.name}</h3>
                    {user.bio ? (
                      <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto italic">"{user.bio}"</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">This user hasn't written a bio yet.</p>
                    )}

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{user.reviewsCount || 0}</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">Reviews Written</div>
                      </div>
                      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{user.moviesCount || 0}</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">Movies Added</div>
                      </div>
                      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">{user.watchlistCount || 0}</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">Watchlist Size</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && <ReviewsView reviews={reviews} />}
                {activeTab === "movies" && <MoviesView movies={movies} />}
                {activeTab === "watchlist" && <WatchlistView watchlist={watchlist} />}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function PublicProfileSummary({ user, isFollowing, followLoading, onFollowToggle, isAuthenticated }) {
  const pictureSrc = (() => {
    const raw = user.profilePicture || "";
    if (!raw) return `https://ui-avatars.com/api/?name=${user.name.replace(" ", "+")}&background=0D8ABC&color=fff&size=256`;
    const normalized = raw.replace(/\\/g, "/");
    if (/^https?:\/\//.test(normalized)) return normalized;
    const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${BASE_URL}${path}`;
  })();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
      <div className="h-32 bg-gradient-to-r from-teal-400 to-blue-500"></div>
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

        <p className="mt-4 text-xs text-gray-400 uppercase tracking-widest font-semibold">Joined {new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{user.followersCount || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{user.followingCount || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Following</div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="mt-6">
            <button
              onClick={onFollowToggle}
              disabled={followLoading}
              className={`w-full py-2.5 rounded-lg font-medium transition-all shadow-sm flex justify-center items-center gap-2 ${isFollowing
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                }`}
            >
              {followLoading && <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>}
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

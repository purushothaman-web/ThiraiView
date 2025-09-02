import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [movies, setMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load profile.");
        }
      }
    };

    fetchProfile();
  }, [token,navigate]);

  // Fetch reviews, watchlist, movies when activeTab changes
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
    { id: "reviews", label: `Reviews (${reviews.length})` },
    { id: "watchlist", label: `Watchlist (${user.watchlistCount ?? 0})` },
    { id: "movies", label: `Movies (${movies.length})` },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>

      {/* Tabs Horizontal Slider */}
      <div className="flex overflow-x-auto no-scrollbar mb-6 border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 mr-4 whitespace-nowrap border-b-4 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {error && (
          <p className="text-red-600 mb-4 text-center font-medium">{error}</p>
        )}

        {loading && <p className="text-center">Loading {activeTab}...</p>}

        {!loading && activeTab === "profile" && (
          <ProfileView user={user} />
        )}

        {!loading && activeTab === "reviews" && (
          <ReviewsView reviews={reviews} />
        )}

        {!loading && activeTab === "watchlist" && (
          <WatchlistView watchlist={watchlist} />
        )}

        {!loading && activeTab === "movies" && <MoviesView movies={movies} />}
      </div>
    </div>
  );
}

function ProfileView({ user }) {
  return (
    <div className="text-center">
      {user.profilePicture && (
        <img
          src={`${BASE_URL}${user.profilePicture}`}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-2 border-gray-300"
        />
      )}
      <h2 className="text-2xl font-semibold mb-1">{user.name}</h2>
      <p className="text-lg text-gray-700 mb-1">@{user.username}</p>
      <p className="text-gray-600 mb-2">{user.email}</p>
      {user.bio && (
        <p className="italic text-gray-700 max-w-xl mx-auto">{user.bio}</p>
      )}
      {user.isVerified ? (
        <p className="mt-3 text-green-600 font-semibold">✔ Verified</p>
      ) : (
        <p className="mt-3 text-yellow-600 font-semibold">⚠ Not Verified</p>
      )}
      <p className="mt-2 font-semibold">
        🎬 Watchlist count: {user.watchlistCount ?? 0}
      </p>
    </div>
  );
}

function ReviewsView({ reviews }) {
  if (reviews.length === 0)
    return <p className="text-center text-gray-500">No reviews found.</p>;

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="border p-4 rounded shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <Link to={`/movies/${review.movieId}`}>
            <h3 className="font-semibold text-blue-600 hover:underline">
              {review.movieTitle}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Rating: {review.rating} / 5
            </p>
            <p>{review.comment}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function WatchlistView({ watchlist }) {
  if (watchlist.length === 0)
    return <p className="text-center text-gray-500">Your watchlist is empty.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {watchlist.map(({ id, movie }) => (
        <Link
          key={id}
          to={`/movies/${movie.id}`}
          className="border rounded overflow-hidden shadow-sm hover:shadow-md transition"
        >
          <img
            src={`${BASE_URL}${movie.poster}`}
            alt={movie.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-2">
            <h3 className="font-semibold text-blue-600 hover:underline">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-600">
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
    return <p className="text-center text-gray-500">No movies found.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {movies.map((movie) => (
        <Link
          key={movie.id}
          to={`/movies/${movie.id}`}
          className="border rounded overflow-hidden shadow-sm hover:shadow-md transition"
        >
          <img
            src={`${BASE_URL}${movie.poster}`}
            alt={movie.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-2">
            <h3 className="font-semibold text-blue-600 hover:underline">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-600">
              {movie.year} — {movie.director}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

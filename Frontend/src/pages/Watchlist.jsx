import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const res = await fetch(`${BASE_URL}/watchlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        setWatchlist(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch watchlist", err);
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [token]);

  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const removeFromWatchlist = async (id) => {
    if (!confirm("Remove from watchlist?")) return;

    try {
      const res = await fetch(`${BASE_URL}/watchlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove from watchlist");

      setWatchlist((prev) => prev.filter((item) => item.id !== id));
      setToast("Removed from watchlist");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleWatched = async (id, watched) => {
    try {
      const res = await fetch(`${BASE_URL}/watchlist/${id}/watched`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ watched }),
      });
      if (!res.ok) throw new Error("Failed to update watched status");

      setWatchlist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, watched } : item
        )
      );
    } catch (err) {
      console.error("Failed to toggle watched status:", err);
      setError("Could not update watched status. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!watchlist.length) return <p>Your watchlist is empty.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {toast && <p className="text-green-500 mb-2">{toast}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <h2 className="text-2xl font-bold mb-4">My Watchlist</h2>
      <ul className="space-y-4">
        {watchlist.map((item) => (
          <li
            key={item.id}
            className="flex items-center bg-gray-100 rounded p-4 shadow-sm"
          >
            <img
              onClick={() => item.movie?.id && navigate(`/movies/${item.movie.id}`)}
              src={`${BASE_URL}${item.movie?.poster || ""}`}
              alt={item.movie?.title || "Movie Poster"}
              className="w-16 h-24 object-cover mr-4 rounded cursor-pointer"
            />
            <div className="flex-grow">
              <h3 className="font-semibold">
                {item.movie?.title || "Untitled"} ({item.movie?.year || "N/A"})
              </h3>
              <p className="text-sm text-gray-600">
                Directed by {item.movie?.director || "Unknown"}
              </p>
            </div>

            <div className="ml-4">
              <input
                type="checkbox"
                checked={item.watched}
                onChange={() => handleToggleWatched(item.id, !item.watched)}
              />
              <span className="ml-2">
                {item.watched ? "Watched ✅" : "Not Watched ❌"}
              </span>
            </div>

            <button
              onClick={() => removeFromWatchlist(item.id)}
              className="text-red-500 hover:underline ml-4"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

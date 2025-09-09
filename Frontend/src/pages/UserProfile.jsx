import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUser();
  }, [id]);

  const pictureSrc = (() => {
    const raw = user?.profilePicture || "";
    if (!raw) return null;
    const normalized = raw.replace(/\\/g, "/");
    if (/^https?:\/\//.test(normalized)) return normalized;
    const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${BASE_URL}${path}`;
  })();

  if (error) return <div className="max-w-3xl mx-auto p-4 text-red-600">{error}</div>;
  if (!user) return <div className="max-w-3xl mx-auto p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
  <div className="bg-white dark:bg-gray-900 rounded shadow p-6 text-center">
        {pictureSrc && (
          <img src={pictureSrc} alt="Profile" className="w-28 h-28 rounded-full object-cover mx-auto mb-3 border" />
        )}
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-600">@{user.username}</p>
        <p className="text-gray-700 mt-2">{user.bio}</p>
      </div>
    </div>
  );
}

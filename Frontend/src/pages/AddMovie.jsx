import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { isNonEmptyString, isYear } from "../components/ui/Validation";

const AddMovie = () => {
  const { user, apiClient } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [poster, setPoster] = useState(null);


  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (!isNonEmptyString(title) || !isNonEmptyString(director) || !isNonEmptyString(year)) {
    setError("All fields are required.");
    return;
  }

  const parsedYear = parseInt(year, 10);
  if (!isYear(parsedYear, { min: 1800, max: new Date().getFullYear() + 1 })) {
    setError("Please enter a valid year.");
    return;
  }

  try {
    // Step 1: Add movie
    const movieResponse = await apiClient.post('/movies', {
      title: title.trim(),
      director: director.trim(),
      year: parsedYear,
    });

    // Step 2: Upload poster (if present)
    if (poster) {
      if (!/(image\/png|image\/jpeg|image\/webp)/.test(poster.type)) {
        setError("Poster must be PNG, JPEG, or WebP");
        return;
      }
      if (poster.size > 5 * 1024 * 1024) {
        setError("Poster must be under 5MB");
        return;
      }
      const formData = new FormData();
      formData.append("poster", poster);

      try {
        await apiClient.post(`/movies/${movieResponse.data.id}/poster`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (posterErr) {
        setError(posterErr.response?.data?.error || "Movie added but failed to upload poster.");
        return;
      }
    }

    setSuccess("Movie added successfully!");
    setTitle("");
    setDirector("");
    setYear("");
    setPoster(null);

    setTimeout(() => navigate("/"), 1500);
  } catch (err) {
    console.error("Error:", err);
    setError(err.response?.data?.error || "Something went wrong. Try again.");
  }
};


  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Add New Movie</h2>

      {error && <p className="text-red-600 dark:text-red-400 mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}
      {success && <p className="text-green-600 dark:text-green-400 mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Director</label>
          <input
            type="text"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm"
            required
            min="1800"
            max={new Date().getFullYear() + 1}
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Poster</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => setPoster(e.target.files[0])}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 dark:hover:file:bg-blue-900/40"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
        >
          Add Movie
        </button>
      </form>
    </div>
  );
};

export default AddMovie;

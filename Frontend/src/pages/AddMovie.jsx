import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AddMovie = () => {
  const { user } = useContext(AuthContext);
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

  if (!title.trim() || !director.trim() || !year) {
    setError("All fields are required.");
    return;
  }

  const parsedYear = parseInt(year, 10);
  if (isNaN(parsedYear) || parsedYear < 1800 || parsedYear > new Date().getFullYear() + 1) {
    setError("Please enter a valid year.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Step 1: Add movie
    const movieRes = await fetch(`${BASE_URL}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        director: director.trim(),
        year: parsedYear,
      }),
    });

    const movieData = await movieRes.json();

    if (!movieRes.ok) {
      setError(movieData.error || "Failed to add movie.");
      return;
    }

    // Step 2: Upload poster (if present)
    if (poster) {
      const formData = new FormData();
      formData.append("poster", poster);

      const posterRes = await fetch(`${BASE_URL}/movies/${movieData.id}/poster`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const posterData = await posterRes.json();

      if (!posterRes.ok) {
        setError(posterData.error || "Movie added but failed to upload poster.");
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
    setError("Something went wrong. Try again.");
  }
};


  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Add New Movie</h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Director</label>
          <input
            type="text"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
            min="1800"
            max={new Date().getFullYear() + 1}
          />
        </div>

        <div className="mb-6">
  <label className="block font-medium mb-1">Poster</label>
  <input
    type="file"
    accept="image/png, image/jpeg, image/webp"
    onChange={(e) => setPoster(e.target.files[0])}
    className="w-full border border-gray-300 rounded p-2"
  />
</div>


        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Movie
        </button>
      </form>
    </div>
  );
};

export default AddMovie;

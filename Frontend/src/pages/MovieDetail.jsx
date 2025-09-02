import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Movie editing state ---
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDirector, setEditDirector] = useState("");
  const [editYear, setEditYear] = useState("");
  const [updateError, setUpdateError] = useState(null);

  // --- Review form state ---
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterUploadError, setPosterUploadError] = useState("");


  useEffect(() => {
    const fetchMovieAndReviews = async () => {
      try {
        setLoading(true);

        const movieRes = await fetch(`${BASE_URL}/movies/${id}`);
        if (!movieRes.ok) throw new Error("Failed to fetch movie");
        const movieData = await movieRes.json();

        const reviewsRes = await fetch(`${BASE_URL}/reviews/movies/${id}/reviews`);
        if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
        const reviewsData = await reviewsRes.json();

        setMovie(movieData);
        setReviews(reviewsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndReviews();
  }, [id]);

  // --- Movie edit functions ---
  const startEditing = () => {
    setEditTitle(movie.title);
    setEditDirector(movie.director);
    setEditYear(movie.year);
    setUpdateError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setUpdateError(null);
  };


const addToWatchlist = async () => {
  try {
    const res = await fetch(`${BASE_URL}/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId: movie.id }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to add to watchlist");
    }

    alert("Added to watchlist!");
  } catch (err) {
    alert(err.message);
  }
};


const handleUpdate = async (e) => {
  e.preventDefault();
  if (!editTitle || !editDirector || !editYear) {
    setUpdateError("All fields are required.");
    return;
  }

  try {
    // Step 1: Update movie details
    const res = await fetch(`${BASE_URL}/movies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editTitle,
        director: editDirector,
        year: parseInt(editYear),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setUpdateError(data.error || "Failed to update movie");
      return;
    }

    // Step 2: If movie update is successful, upload poster (if provided)
    if (posterFile) {
      const formData = new FormData();
      formData.append("poster", posterFile);

      const posterRes = await fetch(`${BASE_URL}/movies/${id}/poster`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const posterData = await posterRes.json();

      if (!posterRes.ok) {
        setPosterUploadError(posterData.error || "Poster upload failed.");
      } else {
        setMovie(posterData); // movie with updated poster
      }
    } else {
      setMovie(data); // update without new poster
    }

    setIsEditing(false);
    setUpdateError("");
  } catch (err) {
    setUpdateError("Something went wrong. Please try again.");
  }
};


  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`${BASE_URL}/movies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete movie");
      } else {
        alert("Movie deleted successfully.");
        navigate("/");
      }
    } catch (err) {
      alert("Something went wrong.");
    }
  };

  // --- Review functions ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!reviewContent.trim()) {
      setFormError("Review content cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/reviews/movies/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: reviewContent.trim(), rating }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setReviews([data, ...reviews]);
        setReviewContent("");
        setRating(5);
        setFormSuccess("Review added successfully!");
      } else {
        setFormError(data.error || "Failed to add review.");
      }
    } catch (err) {
      setFormError("An error occurred.");
    }
  };

  const handleUpdateReview = async () => {
    if (!reviewContent.trim()) {
      setFormError("Review content cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/reviews/${editingReviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: reviewContent.trim(), rating }),
      });

      const data = await res.json();

      if (res.ok) {
        setReviews(reviews.map((r) => (r.id === editingReviewId ? { ...r, ...data } : r)));
        setEditingReviewId(null);
        setReviewContent("");
        setRating(5);
        setFormSuccess("Review updated!");
      } else {
        setFormError(data.error || "Failed to update review.");
      }
    } catch (err) {
      setFormError("Update failed.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== reviewId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete review");
      }
    } catch (err) {
      alert("Error deleting review");
    }
  };

const handleToggleLike = async (review) => {
  if (!user) {
    alert("Please log in to like reviews.");
    return;
  }

  const liked = review.likedByUser;

  try {
    let res;
    if (!liked) {
      // Like review
      res = await fetch(`${BASE_URL}/reviews/${review.id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      // Unlike review
      res = await fetch(`${BASE_URL}/reviews/${review.id}/unlike`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to update like.");
      return;
    }

    // Immutable update with logging
const updatedReviews = reviews.map((r) => {
  if (r.id === review.id) {
    const updatedReview = {
      ...r,
      likedByUser: !liked,
      likesCount: liked ? (r.likesCount || 0) - 1 : (r.likesCount || 0) + 1,
    };
    console.log('Updating review:', updatedReview);
    return updatedReview;
  }
  return r;
});


    console.log('Updated reviews array:', updatedReviews);
    setReviews(updatedReviews);

  } catch (err) {
    alert("Error updating like.");
  }
};



  const startEditingReview = (review) => {
    setEditingReviewId(review.id);
    setReviewContent(review.content);
    setRating(review.rating);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Rendering ---
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!movie) return <div>Movie not found.</div>;

  const canModifyMovie = user && movie && user.id === movie.userId;
  const userAlreadyReviewed = reviews.some((r) => r.user.id === user?.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Movie Section */}
      {!isEditing ? (
        <>
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          {movie.poster && (
            <img
              src={`${BASE_URL}${movie.poster}`}
              alt="Movie Poster"
              className="w-full max-w-xs mb-4 rounded shadow"
            />
          )}
          <p className="text-gray-700 text-lg">Directed by: {movie.director}</p>
          <p className="text-gray-600">Year: {movie.year}</p>
          <p className="text-yellow-600 font-semibold mb-6">
            ⭐ {movie.avgRating ? movie.avgRating.toFixed(1) : "No ratings yet"}
          </p>

          <button
  onClick={addToWatchlist}
  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
>
   Add to Watchlist
</button>


          {canModifyMovie && (
            <div className="mb-6 space-x-2">
              <button
                onClick={startEditing}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4 mb-6">
          {updateError && <p className="text-red-600">{updateError}</p>}
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Title"
          />
          <input
            type="text"
            value={editDirector}
            onChange={(e) => setEditDirector(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Director"
          />
          <input
            type="number"
            value={editYear}
            onChange={(e) => setEditYear(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Year"
          />

          <div>
            <label className="block font-medium mb-1">Update Poster</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setPosterFile(e.target.files[0])}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              Save
            </button>
            <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-gray-400 text-white rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ✅ Reviews Section - hidden when editing */}
      {!isEditing && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
          {user ? (
            (!userAlreadyReviewed || editingReviewId) && (
              <form
                onSubmit={editingReviewId ? handleUpdateReview : handleReviewSubmit}
                className="mb-6 bg-white border p-4 rounded shadow-sm"
              >
                <h3 className="text-lg font-semibold mb-2">
                  {editingReviewId ? "Edit Review" : "Leave a Review"}
                </h3>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows="3"
                  className="w-full border rounded p-2 mb-2"
                  placeholder="Write your review..."
                />
                <div className="flex items-center gap-2 mb-2">
                  <label>Rating:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="border rounded p-1"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                {formError && <p className="text-red-500">{formError}</p>}
                {formSuccess && <p className="text-green-500">{formSuccess}</p>}
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingReviewId ? "Update Review" : "Submit Review"}
                </button>
                {editingReviewId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReviewId(null);
                      setReviewContent("");
                      setRating(5);
                    }}
                    className="ml-2 text-gray-500 underline"
                  >
                    Cancel
                  </button>
                )}
              </form>
            )
          ) : (
            <p className="text-gray-500 mb-6">🔐 You must be logged in to post a review.</p>
          )}

          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                
  <div key={review.id} className="border p-4 rounded bg-white relative">
    <p className="font-semibold">{review.user?.name || "Anonymous"}</p>
    <p>⭐ {review.rating}</p>
    <p>{review.content}</p>
    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>

    {/* New Like section */}
    {user && (
      <button
        onClick={() => handleToggleLike(review)}
        className={`mt-2 px-2 py-1 rounded text-sm ${
          review.likedByUser ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        {review.likedByUser ? "❤️ Liked" : "🤍 Like"} ({review.likesCount || 0})
      </button>
    )}

    {user && user.id === review.user.id && (
      <div className="absolute top-2 right-2 flex gap-2">
<button
  key={`${review.id}-${review.likedByUser}`}  // add likedByUser in key
  onClick={() => handleToggleLike(review)}
  className={`mt-2 px-2 py-1 rounded text-sm ${
    review.likedByUser ? "bg-blue-600 text-white" : "bg-gray-200"
  }`}
>
  {review.likedByUser ? "❤️ Liked" : "🤍 Like"} ({review.likesCount || 0})
</button>

      </div>
    )}
  </div>
))}
            </div>
          )}
        </>
      )}
    </div>
  );

};

export default MovieDetail;

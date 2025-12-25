import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Comments from "../components/Comments";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, apiClient } = useContext(AuthContext);

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // --- Movie editing state ---
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDirector, setEditDirector] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editGenre, setEditGenre] = useState("");
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

        const [movieRes, reviewsRes] = await Promise.all([
          apiClient.get(`/movies/${id}`),
          apiClient.get(`/reviews/movies/${id}/reviews`)
        ]);

        setMovie(movieRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndReviews();
  }, [id, apiClient]);

  // Check if movie already in user's watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!token) return setIsInWatchlist(false);
      try {
        const response = await apiClient.get('/watchlist');
        const items = response.data;
        const exists = Array.isArray(items) && items.some((w) => (w.movieId === Number(id)) || (w.movie && w.movie.id === Number(id)));
        setIsInWatchlist(Boolean(exists));
      } catch (_) {
        setIsInWatchlist(false);
      }
    };
    checkWatchlist();
  }, [token, id, apiClient]);

  // --- Movie edit functions ---
  const startEditing = () => {
    setEditTitle(movie.title);
    setEditDirector(movie.director);
    setEditYear(movie.year);
    setEditGenre(movie.genre || "");
    setUpdateError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setUpdateError(null);
  };


  const addToWatchlist = async () => {
    try {
      await apiClient.post('/watchlist', { movieId: movie.id });
      setFormSuccess("Added to watchlist");
      setIsInWatchlist(true);
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || "Failed to add to watchlist");
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
      const response = await apiClient.put(`/movies/${id}`, {
        title: editTitle,
        director: editDirector,
        year: parseInt(editYear),
        genre: editGenre.trim() || null,
      });

      // Step 2: If movie update is successful, upload poster (if provided)
      if (posterFile) {
        const formData = new FormData();
        formData.append("poster", posterFile);

        try {
          const posterRes = await apiClient.post(`/movies/${id}/poster`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setMovie(posterRes.data); // movie with updated poster
        } catch (posterErr) {
          setPosterUploadError(posterErr.response?.data?.error || "Poster upload failed.");
          setMovie(response.data); // still update with movie data
        }
      } else {
        setMovie(response.data); // update without new poster
      }

      setIsEditing(false);
      setUpdateError("");
    } catch (err) {
      setUpdateError(err.response?.data?.error || "Something went wrong. Please try again.");
    }
  };


  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      await apiClient.delete(`/movies/${id}`);
      setFormSuccess("Movie deleted successfully.");
      navigate("/");
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong.");
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
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      setFormError("Rating must be between 1 and 5");
      return;
    }

    try {
      const response = await apiClient.post(`/reviews/movies/${id}/reviews`, {
        content: reviewContent.trim(),
        rating,
      });

      setReviews([response.data, ...reviews]);
      setReviewContent("");
      setRating(5);
      setFormSuccess("Review added successfully!");
    } catch (err) {
      setFormError(err.response?.data?.error || "An error occurred.");
    }
  };

  const handleUpdateReview = async () => {
    if (!reviewContent.trim()) {
      setFormError("Review content cannot be empty");
      return;
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      setFormError("Rating must be between 1 and 5");
      return;
    }

    try {
      const response = await apiClient.put(`/reviews/${editingReviewId}`, {
        content: reviewContent.trim(),
        rating,
      });

      setReviews(reviews.map((r) => (r.id === editingReviewId ? { ...r, ...response.data } : r)));
      setEditingReviewId(null);
      setReviewContent("");
      setRating(5);
      setFormSuccess("Review updated!");
    } catch (err) {
      setFormError(err.response?.data?.error || "Update failed.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await apiClient.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      setFormError(err.response?.data?.error || "Error deleting review");
    }
  };

  const handleToggleLike = async (review) => {
    if (!user) {
      setFormError("Please log in to like reviews.");
      return;
    }

    const liked = review.likedByUser;

    try {
      if (!liked) {
        // Like review
        await apiClient.post(`/reviews/${review.id}/like`);
      } else {
        // Unlike review
        await apiClient.delete(`/reviews/${review.id}/unlike`);
      }

      // Immutable update with logging
      const updatedReviews = reviews.map((r) => {
        if (r.id === review.id) {
          const updatedReview = {
            ...r,
            likedByUser: !liked,
            likesCount: liked ? (r.likesCount || 1) - 1 : (r.likesCount || 0) + 1,
          };
          console.log('Updating review:', updatedReview);
          return updatedReview;
        }
        return r;
      });


      setReviews(updatedReviews);
    } catch (err) {
      setFormError(err.response?.data?.error || "Error updating like.");
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
              src={movie.poster?.startsWith("http") ? movie.poster : `${BASE_URL}${movie.poster}`}
              alt="Movie Poster"
              className="w-full max-w-xs mb-4 rounded shadow"
            />
          )}
          <p className="text-gray-700 text-lg">Directed by: {movie.director}</p>
          <p className="text-gray-600">Year: {movie.year}</p>
          {movie.genre && <p className="text-gray-600">Genre: {movie.genre}</p>}
          <p className="text-yellow-600 font-semibold mb-6">
            ⭐ {movie.avgRating ? movie.avgRating.toFixed(1) : "No ratings yet"}
          </p>

          <button
            onClick={addToWatchlist}
            disabled={isInWatchlist}
            className={`px-4 py-2 rounded mt-4 ${isInWatchlist ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
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
          <input
            type="text"
            value={editGenre}
            onChange={(e) => setEditGenre(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Genre"
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

                  {user && user.id === review.user.id && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => startEditingReview(review)}
                        className="px-2 py-1 bg-gray-200 rounded text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Comments Section */}
      {reviews.length > 0 && (
        <div className="mt-8">
          {reviews.map((review) => (
            <div key={review.id} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Comments on {review.user?.name || "Anonymous"}'s review
              </h3>
              <Comments reviewId={review.id} />
            </div>
          ))}
        </div>
      )}

    </div>
  );

};

export default MovieDetail;

import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/ui/Button";

const ModeratorDashboard = () => {
  const { apiClient, user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionItem, setActionItem] = useState(null);
  const [actionType, setActionType] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const resReviews = await apiClient.get("/admin/reviews");
      setReviews(resReviews.data.reviews || []);
      const resComments = await apiClient.get("/admin/comments");
      setComments(resComments.data.comments || []);
    } catch (err) {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (item, type) => {
    setActionItem(item);
    setActionType(type);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!actionItem) return;
    try {
      if (actionType === "deleteReview") {
        await apiClient.delete(`/admin/reviews/${actionItem.id}`);
      } else if (actionType === "deleteComment") {
        await apiClient.delete(`/admin/comments/${actionItem.id}`);
      }
      fetchContent();
    } catch (err) {
      setError("Action failed");
    } finally {
      setConfirmOpen(false);
      setActionItem(null);
      setActionType("");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading content...</div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Reviews</h2>
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden mb-8">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Movie</th>
                <th className="px-4 py-2">Content</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2">{r.user?.username}</td>
                  <td className="px-4 py-2">{r.movie?.title}</td>
                  <td className="px-4 py-2">{r.content}</td>
                  <td className="px-4 py-2">
                    <Button variant="danger" onClick={() => handleAction(r, "deleteReview")}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-xl font-semibold mt-6 mb-2">Comments</h2>
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Review</th>
                <th className="px-4 py-2">Content</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.user?.username}</td>
                  <td className="px-4 py-2">{c.review?.id}</td>
                  <td className="px-4 py-2">{c.content}</td>
                  <td className="px-4 py-2">
                    <Button variant="danger" onClick={() => handleAction(c, "deleteComment")}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
            <p className="mb-4">Are you sure you want to delete this item?</p>
            <div className="flex gap-4">
              <Button variant="primary" onClick={confirmAction}>Yes</Button>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>No</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;

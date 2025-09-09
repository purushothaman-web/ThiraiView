import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Button from "./ui/Button";

const SuperuserDashboard = () => {
  const { apiClient, user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    if (user?.isSuperuser) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, usersRes] = await Promise.all([
        apiClient.get("/admin/dashboard"),
        apiClient.get("/admin/users")
      ]);
      
      setDashboardData(dashboardRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      
      const res = await apiClient.get(`/admin/users?${params}`);
      setUsers(res.data.users);
    } catch (err) {
      setError("Failed to load users");
    }
  };

  const fetchMovies = async () => {
    try {
      const res = await apiClient.get("/admin/movies");
      setMovies(res.data.movies);
    } catch (err) {
      setError("Failed to load movies");
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await apiClient.get("/admin/reviews");
      setReviews(res.data.reviews);
    } catch (err) {
      setError("Failed to load reviews");
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "movies") {
      fetchMovies();
    } else if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, searchTerm, roleFilter]);

  const handleUserAction = (targetUser, type) => {
    setActionUser(targetUser);
    setActionType(type);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!actionUser) return;
    
    try {
      switch (actionType) {
        case "block":
          await apiClient.patch(`/admin/users/${actionUser.id}/block`);
          break;
        case "unblock":
          await apiClient.patch(`/admin/users/${actionUser.id}/unblock`);
          break;
        case "delete":
          await apiClient.delete(`/admin/users/${actionUser.id}`);
          break;
        case "make_admin":
          await apiClient.patch(`/admin/users/${actionUser.id}/role`, { role: "ADMIN" });
          break;
        case "make_moderator":
          await apiClient.patch(`/admin/users/${actionUser.id}/role`, { role: "MODERATOR" });
          break;
        case "make_user":
          await apiClient.patch(`/admin/users/${actionUser.id}/role`, { role: "USER" });
          break;
      }
      
      if (activeTab === "users") {
        fetchUsers();
      } else {
        fetchDashboardData();
      }
    } catch (err) {
      setError(`Failed to ${actionType} user`);
    } finally {
      setConfirmOpen(false);
      setActionUser(null);
      setActionType("");
    }
  };

  const deleteMovie = async (movieId) => {
    try {
      await apiClient.delete(`/admin/movies/${movieId}`);
      fetchMovies();
    } catch (err) {
      setError("Failed to delete movie");
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await apiClient.delete(`/admin/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      setError("Failed to delete review");
    }
  };

  if (!user?.isSuperuser) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4">You don't have superuser privileges to access this dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Superuser Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
            SUPERUSER
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {user.username}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "users", label: "Users" },
            { id: "movies", label: "Movies" },
            { id: "reviews", label: "Reviews" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {dashboardData.stats.totalUsers}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Movies
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {dashboardData.stats.totalMovies}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Reviews
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {dashboardData.stats.totalReviews}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Comments
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {dashboardData.stats.totalComments}
            </p>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((targetUser) => (
                  <tr key={targetUser.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {targetUser.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {targetUser.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        targetUser.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        targetUser.role === 'MODERATOR' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {targetUser.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        targetUser.blocked ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {targetUser.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {targetUser.blocked ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUserAction(targetUser, "unblock")}
                          >
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUserAction(targetUser, "block")}
                          >
                            Block
                          </Button>
                        )}
                        
                        {targetUser.role !== 'ADMIN' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUserAction(targetUser, "make_admin")}
                          >
                            Make Admin
                          </Button>
                        )}
                        
                        {targetUser.role !== 'MODERATOR' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUserAction(targetUser, "make_moderator")}
                          >
                            Make Moderator
                          </Button>
                        )}
                        
                        {targetUser.role !== 'USER' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUserAction(targetUser, "make_user")}
                          >
                            Make User
                          </Button>
                        )}
                        
                        {targetUser.id !== user.id && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUserAction(targetUser, "delete")}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movies Tab */}
      {activeTab === "movies" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {movie.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {movie.director} ({movie.year})
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {movie.user?.username || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {movie._count?.reviews || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteMovie(movie.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {review.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {review.movie?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {review.user?.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteReview(review.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {actionType.replace('_', ' ')} user{' '}
              <span className="font-semibold">{actionUser?.username}</span>?
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmAction}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperuserDashboard;

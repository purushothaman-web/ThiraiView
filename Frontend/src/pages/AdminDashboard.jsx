import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/ui/Button";

const AdminDashboard = () => {
  const { apiClient, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (user, type) => {
    setActionUser(user);
    setActionType(type);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!actionUser) return;
    try {
      if (actionType === "block") {
        await apiClient.patch(`/admin/users/${actionUser.id}/block`);
      } else if (actionType === "unblock") {
        await apiClient.patch(`/admin/users/${actionUser.id}/unblock`);
      } else if (actionType === "remove") {
        await apiClient.delete(`/admin/users/${actionUser.id}`);
      } else if (actionType === "admin") {
        await apiClient.patch(`/admin/users/${actionUser.id}/role`, { role: "ADMIN" });
      } else if (actionType === "moderator") {
        await apiClient.patch(`/admin/users/${actionUser.id}/role`, { role: "MODERATOR" });
      } else if (actionType === "user") {
        await apiClient.patch(`/admin/users/${actionUser.id}/role`, { role: "USER" });
      }
      fetchUsers();
    } catch (err) {
      setError("Action failed");
    } finally {
      setConfirmOpen(false);
      setActionUser(null);
      setActionType("");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Blocked</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">{u.blocked ? "Yes" : "No"}</td>
                <td className="px-4 py-2 flex gap-2 flex-wrap">
                  {u.blocked ? (
                    <Button variant="secondary" onClick={() => handleAction(u, "unblock")}>Unblock</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => handleAction(u, "block")}>Block</Button>
                  )}
                  <Button variant="danger" onClick={() => handleAction(u, "remove")}>Remove</Button>
                  {user && user.isSuperuser && (
                    <>
                      <Button variant="primary" onClick={() => handleAction(u, "admin")}>Make Admin</Button>
                      <Button variant="primary" onClick={() => handleAction(u, "moderator")}>Make Moderator</Button>
                      <Button variant="secondary" onClick={() => handleAction(u, "user")}>Make User</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
            <p className="mb-4">Are you sure you want to {actionType} user <b>{actionUser?.username}</b>?</p>
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

export default AdminDashboard;

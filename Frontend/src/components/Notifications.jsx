import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationSkeleton, ListSkeleton } from './ui/Skeleton';

const Notifications = () => {
  const { apiClient } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/notifications?unreadOnly=${activeTab === 'unread'}`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'FOLLOW':
        return '👥';
      case 'REVIEW_LIKE':
        return '❤️';
      case 'COMMENT':
        return '💬';
      case 'COMMENT_REPLY':
        return '↩️';
      case 'MOVIE_ADDED':
        return '🎬';
      default:
        return '🔔';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <ListSkeleton count={5} ItemComponent={NotificationSkeleton} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'unread'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              notification.isRead
                ? 'bg-white border-gray-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1">
                <p className="text-gray-800">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
              </div>
              <div className="flex space-x-2">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToastNotifications } from './ui/Toast';

const FollowButton = ({ userId, username, onFollowChange }) => {
  const { apiClient } = useContext(AuthContext);
  const { showSuccess, showError } = useToastNotifications();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    try {
      const response = await apiClient.get(`/follow/${userId}/status`);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await apiClient.delete(`/follow/${userId}`);
        setIsFollowing(false);
        onFollowChange?.(false);
        showSuccess(`Unfollowed ${username || 'user'}`);
      } else {
        await apiClient.post(`/follow/${userId}`);
        setIsFollowing(true);
        onFollowChange?.(true);
        showSuccess(`Following ${username || 'user'}`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showError(error.response?.data?.error || 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;

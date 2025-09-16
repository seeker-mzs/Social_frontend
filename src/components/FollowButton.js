import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FollowButton = ({ userId, initialFollowing = false, onFollowChange, small = false }) => {
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  // Don't show button for own profile or if not logged in
  if (!currentUser || currentUser.id === userId) {
    return null;
  }

  const handleFollow = async () => {
    setLoading(true);
    console.log(`🔄 Attempting to ${following ? 'unfollow' : 'follow'} user ID:`, userId);
    
    try {
      // FIXED: Use userId instead of user.username
      const response = await api.post(`/users/${userId}/follow`);
      
      console.log('✅ Follow action successful:', response.data);
      
      setFollowing(response.data.following);
      
      if (onFollowChange) {
        onFollowChange(response.data.following, response.data.follower_count);
      }
      
    } catch (error) {
      console.error('❌ Error toggling follow:', {
        userId: userId,
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      
      // Show specific error messages
      if (error.response?.status === 404) {
        alert('Follow endpoint not found. Please check the API URL.');
      } else {
        alert('Failed to update follow status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonClass = small 
    ? `px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        following
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
    : `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        following
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={buttonClass}
      aria-label={following ? `Unfollow user` : `Follow user`}
    >
      {loading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-1">⏳</span>
          {following ? 'Unfollowing...' : 'Following...'}
        </span>
      ) : following ? (
        'Following'
      ) : (
        'Follow'
      )}
    </button>
  );
};

export default FollowButton;
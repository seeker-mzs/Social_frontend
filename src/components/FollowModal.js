import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import FollowButton from './FollowButton';
import UserLink from './UserLink';

const FollowModal = ({ userId, type, isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError('');
    console.log(`🔄 Fetching ${type} for user:`, userId);
    
    try {
      const endpoint = type === 'followers' ? 'followers' : 'followings';
      const response = await api.get(`/users/${userId}/${endpoint}`);
      
      console.log(`✅ ${type} fetched successfully:`, response.data);
      setUsers(response.data[type] || []);
      
    } catch (error) {
      console.error(`❌ Error fetching ${type}:`, {
        userId: userId,
        endpoint: type,
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      
      if (error.response?.status === 404) {
        setError(`${type} endpoint not found. Check API routes.`);
      } else if (error.response?.status === 401) {
        setError('Please log in to view followers/following');
      } else {
        setError('Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    } else if (isOpen && !userId) {
      setError('User ID is missing');
    }
  }, [isOpen, userId, fetchUsers]);

  const handleFollowChange = (userId, isFollowing) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, is_followed_by_auth: isFollowing } : user
      )
    );
  };

  const handleClose = () => {
    setUsers([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-600 animate-pulse">Loading {type}...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="text-red-600 font-medium mb-2">{error}</div>
              <button
                onClick={fetchUsers}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
              >
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500 text-center">
                {type === 'followers' 
                  ? 'No followers yet' 
                  : 'Not following anyone yet'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <UserLink user={user} />
                  <FollowButton 
                    userId={user.id}
                    initialFollowing={user.is_followed_by_auth}
                    onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
                    small={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
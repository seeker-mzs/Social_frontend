import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if we're viewing our own profile or someone else's
  const isOwnProfile = !username || username === currentUser?.username;

  // Fetch user profile data and their posts
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      // If no username in URL, show current user's profile
      const targetUsername = username || currentUser?.username;
      
      // If no target username available yet, skip
      if (!targetUsername) return;
      
      // First, get user data (you might need to create this endpoint)
      // For now, we'll use the current user if it's own profile
      if (isOwnProfile) {
        setProfileUser(currentUser);
      } else {
        // For other users, you'd need a /api/users/{username} endpoint
        // For now, we'll just show basic info
        setProfileUser({ username: targetUsername, name: targetUsername });
      }

      // Fetch user's posts - we'll filter posts by user on frontend for now
      const response = await axios.get('http://localhost:8000/api/posts');
      const allPosts = response.data.data || response.data;
      
      // Filter posts by user (frontend filtering - you might want backend filtering)
      const userPosts = allPosts.filter(post => 
        post.user?.username === targetUsername || 
        post.user_id === currentUser?.id
      );
      
      setUserPosts(userPosts);
      
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, username, isOwnProfile]);

  useEffect(() => {
    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser, fetchProfileData]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <div className="flex items-center mb-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full mr-6 flex items-center justify-center">
              {profileUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profileUser?.name}</h1>
              <p className="text-gray-600">@{profileUser?.username}</p>
              <p className="text-gray-500 mt-2">{profileUser?.email}</p>
              {profileUser?.bio && (
                <p className="text-gray-700 mt-3">{profileUser.bio}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-6 text-center">
            <div>
              <span className="block text-xl font-bold">{userPosts.length}</span>
              <span className="text-gray-600">Posts</span>
            </div>
            {/* Remove or comment out followers/following until we have the API endpoints */}
            {/* <div>
              <span className="block text-xl font-bold">0</span>
              <span className="text-gray-600">Followers</span>
            </div>
            <div>
              <span className="block text-xl font-bold">0</span>
              <span className="text-gray-600">Following</span>
            </div> */}
          </div>

          {isOwnProfile && (
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Edit Profile
            </button>
          )}
        </div>

        {/* User's Posts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {isOwnProfile ? 'Your Posts' : 'Posts'}
          </h2>
          
          {userPosts.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              {isOwnProfile ? 'You haven\'t posted anything yet.' : 'No posts yet.'}
            </p>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div key={post.id} className="border-b pb-4 last:border-b-0">
                  <p className="mb-2">{post.content}</p>
                  <p className="text-sm text-gray-500">
                    Posted on {new Date(post.created_at).toLocaleDateString()} at{' '}
                    {new Date(post.created_at).toLocaleTimeString()}
                  </p>
                  <div className="flex space-x-4 text-sm text-gray-500 mt-2">
                    <span>Likes: {post.likes_count || 0}</span>
                    <span>Comments: {post.comments_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
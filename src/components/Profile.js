import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import CommentSection from './CommentSection';
import FollowButton from './FollowButton';
import FollowModal from './FollowModal';
import UserLink from './UserLink';

const Profile = () => {
  // Authentication and routing hooks
  const { user: currentUser } = useAuth();
  const { username } = useParams();
  
  // State management
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCommentSections, setOpenCommentSections] = useState({});
  const [likingPosts, setLikingPosts] = useState({});
  const [followStats, setFollowStats] = useState({
    followers_count: 0,
    following_count: 0
  });
  const [followModal, setFollowModal] = useState({
    isOpen: false,
    type: 'followers',
    userId: null
  });

  // Check if viewing own profile
  const isOwnProfile = !username || username === currentUser?.username;

  // Fetch follow stats for any user - FIXED: Use username parameter
  const fetchFollowStats = useCallback(async (username) => {
    if (!username) return;
    
    try {
      console.log(`📊 Fetching follow stats for username: ${username}`);
      const [followersResponse, followingResponse] = await Promise.all([
        api.get(`/users/${username}/followers`),
        api.get(`/users/${username}/followings`)
      ]);
      
      setFollowStats({
        followers_count: followersResponse.data.count,
        following_count: followingResponse.data.count
      });
    } catch (error) {
      console.error('❌ Error fetching follow stats:', error);
    }
  }, []);

  // Toggle comment section visibility for a specific post
  const toggleComments = (postId) => {
    setOpenCommentSections(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Handle post like functionality
  const handleLikePost = async (postId) => {
    if (!currentUser) return;
    
    setLikingPosts(prev => ({ ...prev, [postId]: true }));
    
    try {
      await api.post(`/posts/${postId}/like`);
      fetchProfileData(); // Refresh to update like counts
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post');
    } finally {
      setLikingPosts(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Update follow stats when follow status changes
  const handleFollowChange = (isFollowing, newFollowerCount) => {
    setFollowStats(prev => ({
      ...prev,
      followers_count: newFollowerCount
    }));
  };

  // Modal control functions
  const openFollowersModal = () => {
    if (profileUser?.id) {
      setFollowModal({ isOpen: true, type: 'followers', userId: profileUser.id });
    }
  };

  const openFollowingModal = () => {
    if (profileUser?.id) {
      setFollowModal({ isOpen: true, type: 'followings', userId: profileUser.id });
    }
  };

  const closeFollowModal = () => {
    setFollowModal({ isOpen: false, type: 'followers', userId: null });
  };

  // Fetch user profile data
  const fetchUserProfile = useCallback(async (targetUsername) => {
    try {
      const response = await api.get(`/users/${targetUsername}/profile`);
      setProfileUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }, []);

  // Fetch user's posts using dedicated endpoint
  const fetchUserPosts = useCallback(async (targetUsername) => {
    try {
      const response = await api.get(`/users/${targetUsername}/posts`);
      setUserPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    }
  }, []);

  // Fetch profile data including posts and follow statistics
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const targetUsername = username || currentUser?.username;
      
      if (!targetUsername) return;
      
      // Fetch user profile data
      const userData = await fetchUserProfile(targetUsername);
      
      // Fetch user's posts using dedicated endpoint
      await fetchUserPosts(targetUsername);
      
      // Fetch follow stats - FIXED: Pass username instead of ID
      if (userData.username) {
        await fetchFollowStats(userData.username);
      }
      
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, username, fetchUserProfile, fetchUserPosts, fetchFollowStats]);

  // Fetch profile data on component mount or when dependencies change
  useEffect(() => {
    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser, fetchProfileData]);

  // Loading state UI
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Main profile UI
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Profile Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center mb-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full mr-6 flex items-center justify-center">
              {profileUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profileUser?.name}</h1>
                  <p className="text-gray-600">@{profileUser?.username}</p>
                  <p className="text-gray-500 mt-2">{profileUser?.email}</p>
                  {profileUser?.bio && (
                    <p className="text-gray-700 mt-3">{profileUser.bio}</p>
                  )}
                </div>
                {/* Follow Button - Only visible on other users' profiles */}
                {!isOwnProfile && profileUser?.id && (
                  <FollowButton 
                    userId={profileUser.id} 
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Statistics */}
          <div className="flex space-x-6 text-center mt-4">
            <div>
              <span className="block text-xl font-bold">{userPosts.length}</span>
              <span className="text-gray-600">Posts</span>
            </div>
            <div 
              className="cursor-pointer hover:text-blue-600"
              onClick={openFollowersModal}
            >
              <span className="block text-xl font-bold">{followStats.followers_count}</span>
              <span className="text-gray-600">Followers</span>
            </div>
            <div 
              className="cursor-pointer hover:text-blue-600"
              onClick={openFollowingModal}
            >
              <span className="block text-xl font-bold">{followStats.following_count}</span>
              <span className="text-gray-600">Following</span>
            </div>
          </div>

          {/* Edit Profile Button - Only visible on own profile */}
          {isOwnProfile && (
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Edit Profile
            </button>
          )}
        </div>

        {/* User's Posts Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">
            {isOwnProfile ? 'Your Posts' : 'Posts'}
          </h2>
          
          {userPosts.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">
                {isOwnProfile ? 'You haven\'t posted anything yet.' : 'No posts yet.'}
              </p>
            </div>
          ) : (
            userPosts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-md">
                
                {/* Post Header with Clickable User Link */}
                <div className="flex items-center mb-3">
                  <UserLink user={post.user} />
                  <p className="text-sm text-gray-500 ml-3">
                    {new Date(post.created_at).toLocaleDateString()} at{' '}
                    {new Date(post.created_at).toLocaleTimeString()}
                  </p>
                </div>
                
                {/* Post Content */}
                <p className="mb-4 text-gray-800">{post.content}</p>
                
                {/* In Profile.js, add this to the post rendering section: */}
                {post.image_url && (
                  <div className="mb-4">
                    <img
                      src={post.image_url}
                      alt="Post content"
                      className="w-full h-auto rounded-lg max-h-96 object-contain border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Post Engagement Statistics */}
                <div className="flex justify-between text-sm text-gray-500 mb-3 border-b pb-3">
                  <span>{post.likes_count || 0} likes</span>
                  <span>{post.comments_count || 0} comments</span>
                </div>
                
                {/* Post Action Buttons */}
                <div className="flex space-x-4 text-gray-500 text-sm">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    disabled={likingPosts[post.id]}
                    className={`hover:text-blue-600 flex-1 py-2 ${
                      likingPosts[post.id] ? 'opacity-50' : ''
                    }`}
                  >
                    {likingPosts[post.id] ? 'Liking...' : 'Like'}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="hover:text-green-600 flex-1 py-2"
                  >
                    Comment
                  </button>
                  <button className="hover:text-gray-700 flex-1 py-2">
                    Share
                  </button>
                </div>

                {/* Comment Section (Conditionally Rendered) */}
                <CommentSection 
                  postId={post.id}
                  isOpen={openCommentSections[post.id] || false}
                  onCommentAdded={fetchProfileData}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Follow Modal Popup */}
      <FollowModal
        isOpen={followModal.isOpen}
        type={followModal.type}
        userId={followModal.userId}
        onClose={closeFollowModal}
      />
    </div>
  );
};

export default Profile;